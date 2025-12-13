"""
Apollo.io API client utilities
"""
from typing import Optional, Dict, List
import httpx
from app.core.config import settings


class ApolloClient:
    """Client for Apollo.io API"""
    
    BASE_URL = "https://api.apollo.io/v1"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.APOLLO_API_KEY
    
    async def search_people(
        self,
        query: str,
        person_titles: Optional[List[str]] = None,
        person_locations: Optional[List[str]] = None,
        limit: int = 10
    ) -> Dict:
        """
        Search for people/contacts in Apollo.io
        
        Args:
            query: Search query (name, email, company name, etc.)
            person_titles: Filter by job titles
            person_locations: Filter by locations
            limit: Maximum number of results
            
        Returns:
            Dict with search results
        """
        try:
            url = f"{self.BASE_URL}/mixed_people/search"
            
            data = {
                "api_key": self.api_key,
                "q_keywords": query,
                "per_page": limit,
                "page": 1
            }
            
            if person_titles:
                data["person_titles"] = person_titles
            
            if person_locations:
                data["person_locations"] = person_locations
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=data)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {
                        "error": f"Apollo API error: {response.status_code}",
                        "detail": response.text
                    }
                    
        except Exception as e:
            return {
                "error": f"Error connecting to Apollo API: {str(e)}"
            }
    
    async def search_companies(
        self,
        query: str,
        limit: int = 10
    ) -> Dict:
        """
        Search for companies in Apollo.io
        
        Args:
            query: Search query (company name, domain, etc.)
            limit: Maximum number of results
            
        Returns:
            Dict with search results
        """
        try:
            url = f"{self.BASE_URL}/organizations/search"
            
            data = {
                "api_key": self.api_key,
                "q_keywords": query,
                "per_page": limit,
                "page": 1
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=data)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {
                        "error": f"Apollo API error: {response.status_code}",
                        "detail": response.text
                    }
                    
        except Exception as e:
            return {
                "error": f"Error connecting to Apollo API: {str(e)}"
            }


async def search_apollo(query: str, search_type: str = "people") -> Dict:
    """
    Convenience function to search Apollo.io
    
    Args:
        query: Search query
        search_type: Type of search ("people" or "companies")
        
    Returns:
        Dict with search results
    """
    client = ApolloClient()
    
    if search_type == "companies":
        return await client.search_companies(query)
    else:
        return await client.search_people(query)

