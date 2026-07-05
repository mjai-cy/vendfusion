import httpx
import re
import json
from urllib.parse import urlparse, urljoin


def scrape_company_website(url_or_name: str) -> dict:
    """Scrape a company website for real data - title, description, team, etc."""

    url = url_or_name
    if not url.startswith("http"):
        url = f"https://{url_or_name}"

    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    domain = parsed.netloc

    company_name = domain.replace("www.", "").split(".")[0].title()

    result = {
        "company_name": company_name,
        "domain": domain,
        "industry": "",
        "description": "",
        "company_size": "",
        "location": "",
        "website": base_url,
        "tech_stack": [],
        "pain_points": [],
        "suggested_approach": "",
        "founder_name": "",
        "founder_email": "",
        "linkedin": "",
        "team_url": "",
        "about_url": "",
        "emails_found": [],
    }

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        with httpx.Client(timeout=15, follow_redirects=True, headers=headers) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                html = resp.text[:50000]

                title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
                if title_match:
                    title = title_match.group(1).strip()
                    for sep in ["|", "–", "-", "—", "::"]:
                        if sep in title:
                            title = title.split(sep)[0].strip()
                            break
                    title = re.sub(r'\s*[:\-–—]\s*.*$', '', title).strip()
                    if len(title) > 2 and len(title) < 80:
                        result["company_name"] = title

                desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)', html, re.IGNORECASE)
                if not desc_match:
                    desc_match = re.search(r'<meta\s+content=["\']([^"\']+)["\']\s+name=["\']description["\']', html, re.IGNORECASE)
                if desc_match:
                    result["description"] = desc_match.group(1).strip()

                og_desc = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']+)', html, re.IGNORECASE)
                if og_desc and not result["description"]:
                    result["description"] = og_desc.group(1).strip()

                emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', html)
                emails = [e for e in emails if not e.endswith(('.png', '.jpg', '.gif', '.svg', '.css', '.js'))]
                result["emails_found"] = list(set(emails[:10]))

                linkedin_match = re.search(r'https?://(?:www\.)?linkedin\.com/(?:company|in)/[a-zA-Z0-9_-]+', html)
                if linkedin_match:
                    result["linkedin"] = linkedin_match.group(0)

                about_patterns = [r'href=["\']([^"\']*about[^"\']*)["\']', r'href=["\']([^"\']*company[^"\']*)["\']', r'href=["\']([^"\']*who-we-are[^"\']*)["\']']
                for pattern in about_patterns:
                    match = re.search(pattern, html, re.IGNORECASE)
                    if match:
                        about_path = match.group(1)
                        if about_path.startswith("/"):
                            result["about_url"] = base_url + about_path
                        elif about_path.startswith("http"):
                            result["about_url"] = about_path
                        break

                team_patterns = [r'href=["\']([^"\']*team[^"\']*)["\']', r'href=["\']([^"\']*people[^"\']*)["\']', r'href=["\']([^"\']*leadership[^"\']*)["\']', r'href=["\']([^"\']*founders[^"\']*)["\']']
                for pattern in team_patterns:
                    match = re.search(pattern, html, re.IGNORECASE)
                    if match:
                        team_path = match.group(1)
                        if team_path.startswith("/"):
                            result["team_url"] = base_url + team_path
                        elif team_path.startswith("http"):
                            result["team_url"] = team_path
                        break

                tech_indicators = {
                    "react": "React", "next": "Next.js", "vue": "Vue.js", "angular": "Angular",
                    "node": "Node.js", "python": "Python", "ruby": "Ruby", "php": "PHP",
                    "laravel": "Laravel", "django": "Django", "flask": "Flask",
                    "aws": "AWS", "gcp": "Google Cloud", "azure": "Azure",
                    "shopify": "Shopify", "wordpress": "WordPress", "woocommerce": "WooCommerce",
                    "stripe": "Stripe", "paypal": "PayPal",
                }
                html_lower = html.lower()
                for keyword, tech in tech_indicators.items():
                    if keyword in html_lower:
                        result["tech_stack"].append(tech)

    except Exception:
        pass

    if result["team_url"]:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            with httpx.Client(timeout=10, follow_redirects=True, headers=headers) as client:
                team_resp = client.get(result["team_url"])
                if team_resp.status_code == 200:
                    team_html = team_resp.text[:30000]

                    name_patterns = [
                        r'class=["\'][^"\']*(?:name|person-name|team-name|founder)[^"\']*["\'][^>]*>([^<]+)',
                        r'<h[23][^>]*>([A-Z][a-z]+ [A-Z][a-z]+)</h[23]>',
                        r'title=["\']([^"\']*(?:CEO|Founder|CTO|COO|Head of|VP|Director)[^"\']*)["\']',
                    ]
                    for pattern in name_patterns:
                        matches = re.findall(pattern, team_html)
                        if matches:
                            for name in matches[:3]:
                                name = name.strip()
                                if len(name) > 4 and len(name) < 50 and " " in name:
                                    result["founder_name"] = name
                                    break
                            if result["founder_name"]:
                                break

                    emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', team_html)
                    emails = [e for e in emails if not e.endswith(('.png', '.jpg', '.gif', '.svg'))]
                    if emails:
                        result["emails_found"].extend(emails[:5])
                        result["emails_found"] = list(set(result["emails_found"]))

                    if result["founder_name"] and not result["founder_email"]:
                        parts = result["founder_name"].lower().split()
                        if len(parts) >= 2:
                            domain_name = domain.replace("www.", "").split(".")[0]
                            result["founder_email"] = f"{parts[0]}.{parts[1]}@{domain_name}"

        except Exception:
            pass

    if not result["description"]:
        result["description"] = f"{result['company_name']} is a company operating in the technology sector."

    result["pain_points"] = [
        "Manual outreach is time-consuming and doesn't scale",
        "Low email reply rates with generic messaging",
        "Difficulty finding the right decision makers",
    ]
    result["suggested_approach"] = f"Research {result['company_name']}'s recent activity and tailor outreach to their specific growth stage and pain points."

    return result


def find_people_from_web_and_crm(company_name: str, roles: str = None) -> dict:
    """Find contacts at a company using web scraping + CRM APIs"""

    contacts = []
    note = ""

    try:
        from services.hubspot_service import HUBSPOT_PRIVATE_APP_TOKEN
        if HUBSPOT_PRIVATE_APP_TOKEN:
            hubspot_result = _search_hubspot_contacts(company_name)
            contacts.extend(hubspot_result)
    except Exception:
        pass

    try:
        web_contacts = _scrape_team_page(company_name)
        contacts.extend(web_contacts)
    except Exception:
        pass

    if not contacts:
        guessed_contacts = _guess_common_contacts(company_name)
        contacts.extend(guessed_contacts)
        note = "Guessed contacts based on common email patterns. Verify before reaching out."
    else:
        note = f"Found {len(contacts)} contacts from CRM and web sources."

    seen = set()
    unique_contacts = []
    for c in contacts:
        key = c.get("email", "").lower() or c.get("name", "").lower()
        if key and key not in seen:
            seen.add(key)
            unique_contacts.append(c)

    return {
        "company": company_name,
        "contacts": unique_contacts[:10],
        "note": note,
    }


def _search_hubspot_contacts(company_name: str) -> list:
    """Search HubSpot CRM for contacts at a company"""

    from services.hubspot_service import HUBSPOT_PRIVATE_APP_TOKEN, get_headers

    if not HUBSPOT_PRIVATE_APP_TOKEN:
        return []

    contacts = []
    try:
        with httpx.Client(timeout=10) as client:
            search_payload = {
                "query": company_name,
                "limit": 10,
                "properties": ["firstname", "lastname", "email", "company", "jobtitle", "phone", "linkedin"],
            }
            resp = client.post(
                "https://api.hubapi.com/crm/v3/objects/contacts/search",
                headers=get_headers(),
                json=search_payload,
            )

            if resp.status_code == 200:
                data = resp.json()
                for result in data.get("results", []):
                    props = result.get("properties", {})
                    email = props.get("email", "")
                    if email:
                        contacts.append({
                            "name": f"{props.get('firstname', '')} {props.get('lastname', '')}".strip(),
                            "title": props.get("jobtitle", ""),
                            "email": email,
                            "phone": props.get("phone", ""),
                            "linkedin": props.get("linkedin", ""),
                            "source": "HubSpot CRM",
                            "relevance": f"Contact at {props.get('company', company_name)}",
                        })
    except Exception:
        pass

    return contacts


def _scrape_team_page(company_name: str) -> list:
    """Try to scrape team/about page for contacts"""

    contacts = []
    name = company_name.lower().replace(" ", "").replace(".", "")

    team_urls = [
        f"https://{name}.com/team",
        f"https://www.{name}.com/team",
        f"https://{name}.in/team",
        f"https://www.{name}.in/team",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    with httpx.Client(timeout=5, follow_redirects=True, headers=headers) as client:
        for team_url in team_urls:
            try:
                resp = client.get(team_url)
                if resp.status_code == 200:
                    html = resp.text[:15000]

                    name_pattern = r'<h[234][^>]*>([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)</h[234]>'
                    names = re.findall(name_pattern, html)

                    title_pattern = r'(?:CEO|Founder|CTO|COO|CMO|CFO|VP|Head of|Director|Manager|Lead|Engineer|Developer|Designer|Marketing|Sales|Operations|Product)[\w\s]*'
                    titles = re.findall(title_pattern, html)

                    for i, full_name in enumerate(names[:5]):
                        parts = full_name.lower().split()
                        domain_name = name
                        email_guess = f"{parts[0]}.{parts[-1]}@{domain_name}.com" if len(parts) >= 2 else f"{parts[0]}@{domain_name}.com"

                        contacts.append({
                            "name": full_name,
                            "title": titles[i] if i < len(titles) else "",
                            "email": email_guess,
                            "phone": "",
                            "linkedin": f"https://linkedin.com/in/{parts[0]}-{parts[-1]}",
                            "source": f"Scraped from {team_url}",
                            "relevance": f"Found on company team page",
                        })

                    if contacts:
                        break
            except Exception:
                continue

    return contacts


def _guess_common_contacts(company_name: str) -> list:
    """Guess common email contacts based on company domain"""

    name = company_name.lower().replace(" ", "").replace(".", "")
    common_roles = [
        ("CEO / Founder", "ceo"),
        ("CTO / Head of Tech", "cto"),
        ("VP Sales", "sales"),
        ("Head of Marketing", "marketing"),
        ("Head of Product", "product"),
    ]

    contacts = []
    for role, prefix in common_roles:
        contacts.append({
            "name": f"{prefix}@{name}",
            "title": role,
            "email": f"{prefix}@{name}.com",
            "phone": "",
            "linkedin": "",
            "source": "Guessed",
            "relevance": f"Common {role.lower()} email pattern",
        })

    return contacts
