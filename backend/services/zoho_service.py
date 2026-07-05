import httpx
from dotenv import load_dotenv
import os

load_dotenv()

ZOHO_CLIENT_ID = os.getenv("ZOHO_CLIENT_ID")
ZOHO_CLIENT_SECRET = os.getenv("ZOHO_CLIENT_SECRET")
ZOHO_REDIRECT_URI = os.getenv("ZOHO_REDIRECT_URI")
ZOHO_TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token"
ZOHO_API_URL = "https://www.zohoapis.com/crm/v2"


def get_auth_url() -> str:
    """Generate Zoho OAuth authorization URL"""

    if not ZOHO_CLIENT_ID:
        return None

    return (
        f"https://accounts.zoho.com/oauth/v2/auth"
        f"?scope=ZohoCRM.modules.ALL"
        f"&client_id={ZOHO_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={ZOHO_REDIRECT_URI}"
    )


def exchange_code_for_token(code: str) -> dict:
    """Exchange authorization code for access token"""

    if not ZOHO_CLIENT_ID or not ZOHO_CLIENT_SECRET:
        return {"error": "Zoho not configured"}

    try:
        response = httpx.post(ZOHO_TOKEN_URL, data={
            "grant_type": "authorization_code",
            "client_id": ZOHO_CLIENT_ID,
            "client_secret": ZOHO_CLIENT_SECRET,
            "code": code,
            "redirect_uri": ZOHO_REDIRECT_URI,
        })

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }
        else:
            return {"success": False, "error": f"Token exchange failed: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def refresh_access_token(refresh_token: str) -> dict:
    """Refresh Zoho access token"""

    if not ZOHO_CLIENT_ID or not ZOHO_CLIENT_SECRET:
        return {"error": "Zoho not configured"}

    try:
        response = httpx.post(ZOHO_TOKEN_URL, data={
            "grant_type": "refresh_token",
            "client_id": ZOHO_CLIENT_ID,
            "client_secret": ZOHO_CLIENT_SECRET,
            "refresh_token": refresh_token,
        })

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "access_token": data.get("access_token"),
            }
        else:
            return {"success": False, "error": f"Token refresh failed: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def get_headers(access_token: str):
    return {
        "Authorization": f"Zoho-oauthtoken {access_token}",
        "Content-Type": "application/json"
    }


def get_contacts(access_token: str, page: int = 1, per_page: int = 100) -> dict:
    """Get contacts from Zoho CRM"""

    try:
        response = httpx.get(
            f"{ZOHO_API_URL}/Contacts",
            headers=get_headers(access_token),
            params={"page": page, "per_page": per_page}
        )

        if response.status_code == 200:
            data = response.json()
            contacts = []
            for contact in data.get("data", []):
                contacts.append({
                    "zoho_id": contact.get("id"),
                    "email": contact.get("Email"),
                    "first_name": contact.get("First_Name"),
                    "last_name": contact.get("Last_Name"),
                    "company": contact.get("Account_Name", {}).get("name") if isinstance(contact.get("Account_Name"), dict) else contact.get("Account_Name"),
                    "job_title": contact.get("Title"),
                    "phone": contact.get("Phone"),
                })
            return {
                "contacts": contacts,
                "total": data.get("info", {}).get("total_count", 0),
                "page": page,
                "per_page": per_page
            }
        else:
            return {"error": f"Zoho API error: {response.status_code}", "contacts": []}

    except Exception as e:
        return {"error": str(e), "contacts": []}


def create_contact(access_token: str, contact_data: dict) -> dict:
    """Create a contact in Zoho CRM"""

    try:
        payload = {
            "data": [{
                "First_Name": contact_data.get("first_name"),
                "Last_Name": contact_data.get("last_name"),
                "Email": contact_data.get("email"),
                "Title": contact_data.get("job_title"),
                "Phone": contact_data.get("phone"),
                "Company": contact_data.get("company"),
            }]
        }

        response = httpx.post(
            f"{ZOHO_API_URL}/Contacts",
            headers=get_headers(access_token),
            json=payload
        )

        if response.status_code == 201:
            data = response.json()
            contact_id = data.get("data", [{}])[0].get("id")
            return {
                "success": True,
                "zoho_id": contact_id,
                "message": "Contact created in Zoho"
            }
        else:
            return {"success": False, "error": f"Zoho API error: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def update_contact(access_token: str, zoho_id: str, contact_data: dict) -> dict:
    """Update a contact in Zoho CRM"""

    try:
        payload = {
            "data": [{
                "id": zoho_id,
                "First_Name": contact_data.get("first_name"),
                "Last_Name": contact_data.get("last_name"),
                "Email": contact_data.get("email"),
                "Title": contact_data.get("job_title"),
                "Phone": contact_data.get("phone"),
                "Company": contact_data.get("company"),
            }]
        }

        response = httpx.put(
            f"{ZOHO_API_URL}/Contacts/{zoho_id}",
            headers=get_headers(access_token),
            json=payload
        )

        if response.status_code == 200:
            return {"success": True, "message": "Contact updated in Zoho"}
        else:
            return {"success": False, "error": f"Zoho API error: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_contact(access_token: str, zoho_id: str) -> dict:
    """Delete a contact from Zoho CRM"""

    try:
        response = httpx.delete(
            f"{ZOHO_API_URL}/Contacts/{zoho_id}",
            headers=get_headers(access_token)
        )

        if response.status_code == 200:
            return {"success": True, "message": "Contact deleted from Zoho"}
        else:
            return {"success": False, "error": f"Zoho API error: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def sync_contacts_to_zoho(access_token: str, leads: list) -> dict:
    """Sync multiple leads to Zoho CRM"""

    results = []
    for lead in leads:
        result = create_contact(access_token, lead)
        results.append(result)

    successful = sum(1 for r in results if r.get("success"))
    failed = sum(1 for r in results if not r.get("success"))

    return {
        "total": len(leads),
        "successful": successful,
        "failed": failed,
        "results": results
    }
