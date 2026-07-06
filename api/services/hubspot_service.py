import httpx
from dotenv import load_dotenv
import os

load_dotenv()

HUBSPOT_API_URL = "https://api.hubapi.com"
HUBSPOT_PRIVATE_APP_TOKEN = os.getenv("HUBSPOT_PRIVATE_APP_TOKEN")


def get_headers():
    return {
        "Authorization": f"Bearer {HUBSPOT_PRIVATE_APP_TOKEN}",
        "Content-Type": "application/json"
    }


def get_contacts(limit: int = 100, after: str = None) -> dict:
    """Get contacts from HubSpot"""

    if not HUBSPOT_PRIVATE_APP_TOKEN:
        return {"error": "HubSpot not configured", "contacts": []}

    try:
        params = {"limit": limit}
        if after:
            params["after"] = after

        response = httpx.get(
            f"{HUBSPOT_API_URL}/crm/v3/objects/contacts",
            headers=get_headers(),
            params=params
        )

        if response.status_code == 200:
            data = response.json()
            contacts = []
            for contact in data.get("results", []):
                props = contact.get("properties", {})
                contacts.append({
                    "hubspot_id": contact.get("id"),
                    "email": props.get("email"),
                    "first_name": props.get("firstname"),
                    "last_name": props.get("lastname"),
                    "company": props.get("company"),
                    "job_title": props.get("jobtitle"),
                    "phone": props.get("phone"),
                })
            return {
                "contacts": contacts,
                "total": data.get("total", 0),
                "has_more": data.get("paging", {}).get("next", {}).get("after") is not None
            }
        else:
            return {"error": f"HubSpot API error: {response.status_code}", "contacts": []}

    except Exception as e:
        return {"error": str(e), "contacts": []}


def create_contact(contact_data: dict) -> dict:
    """Create a contact in HubSpot"""

    if not HUBSPOT_PRIVATE_APP_TOKEN:
        return {"error": "HubSpot not configured"}

    try:
        properties = {
            "email": contact_data.get("email"),
            "firstname": contact_data.get("first_name"),
            "lastname": contact_data.get("last_name"),
            "company": contact_data.get("company"),
            "jobtitle": contact_data.get("job_title"),
            "phone": contact_data.get("phone"),
        }

        response = httpx.post(
            f"{HUBSPOT_API_URL}/crm/v3/objects/contacts",
            headers=get_headers(),
            json={"properties": properties}
        )

        if response.status_code == 201:
            data = response.json()
            return {
                "success": True,
                "hubspot_id": data.get("id"),
                "message": "Contact created in HubSpot"
            }
        else:
            return {"success": False, "error": f"HubSpot API error: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def update_contact(hubspot_id: str, contact_data: dict) -> dict:
    """Update a contact in HubSpot"""

    if not HUBSPOT_PRIVATE_APP_TOKEN:
        return {"error": "HubSpot not configured"}

    try:
        properties = {}
        if contact_data.get("email"):
            properties["email"] = contact_data["email"]
        if contact_data.get("first_name"):
            properties["firstname"] = contact_data["first_name"]
        if contact_data.get("last_name"):
            properties["lastname"] = contact_data["last_name"]
        if contact_data.get("company"):
            properties["company"] = contact_data["company"]
        if contact_data.get("job_title"):
            properties["jobtitle"] = contact_data["job_title"]
        if contact_data.get("phone"):
            properties["phone"] = contact_data["phone"]

        response = httpx.patch(
            f"{HUBSPOT_API_URL}/crm/v3/objects/contacts/{hubspot_id}",
            headers=get_headers(),
            json={"properties": properties}
        )

        if response.status_code == 200:
            return {"success": True, "message": "Contact updated in HubSpot"}
        else:
            return {"success": False, "error": f"HubSpot API error: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_contact(hubspot_id: str) -> dict:
    """Delete a contact from HubSpot"""

    if not HUBSPOT_PRIVATE_APP_TOKEN:
        return {"error": "HubSpot not configured"}

    try:
        response = httpx.delete(
            f"{HUBSPOT_API_URL}/crm/v3/objects/contacts/{hubspot_id}",
            headers=get_headers()
        )

        if response.status_code == 204:
            return {"success": True, "message": "Contact deleted from HubSpot"}
        else:
            return {"success": False, "error": f"HubSpot API error: {response.status_code}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def sync_contacts_to_hubspot(leads: list) -> dict:
    """Sync multiple leads to HubSpot"""

    results = []
    for lead in leads:
        result = create_contact(lead)
        results.append(result)

    successful = sum(1 for r in results if r.get("success"))
    failed = sum(1 for r in results if not r.get("success"))

    return {
        "total": len(leads),
        "successful": successful,
        "failed": failed,
        "results": results
    }
