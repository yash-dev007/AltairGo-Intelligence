import uuid
from datetime import datetime
from urllib.parse import urlencode
from database import db_session
from models import BookingClick

class AffiliateURLBuilder:
    def __init__(self, partner_config):
        self.partner_config = partner_config
    
    def build_url(self, partner_name, link_type, destination, tracking_id):
        """Builds an affiliate URL to redirect the user to."""
        if partner_name not in self.partner_config:
            raise ValueError("Unknown partner")
            
        partner = self.partner_config[partner_name]
        base_url = partner["base_url"]
        
        # Build tracking parameters based on partner requirements
        params = {}
        if "affiliate_param" in partner:
            params[partner["affiliate_param"]] = partner["affiliate_id"]
            
        params["utm_source"] = "altairgo"
        params["utm_medium"] = "website"
        params["utm_campaign"] = f"{link_type}_booking"
        params["tracking_id"] = tracking_id # Custom DB tracker
        
        # Depending on partner, you might want to dynamically set origin/dest in URL,
        # but for this MVP, we just use a generic search page
        search_query = urlencode({'q': destination})
        
        # Combining
        full_url = f"{base_url}?{urlencode(params)}&{search_query}"
        return full_url


class ClickTracker:
    def track_click(self, user_id, link_type, destination, partner, request) -> str:
        """Tracks the click, saves to DB, and returns a unique tracking string."""
        tracking_id = str(uuid.uuid4())
        
        click = BookingClick(
            user_id=user_id,
            link_type=link_type,
            destination=destination,
            partner=partner,
            tracking_id=tracking_id,
            user_agent=request.headers.get('User-Agent', '')[:255],
            ip_address=request.remote_addr,
            referrer=request.referrer[:255] if request.referrer else None,
            estimated_revenue=RevenueCalculator().estimate_single_click(link_type)
        )
        
        db_session.add(click)
        try:
            db_session.commit()
        except Exception as e:
            db_session.rollback()
            print(f"Failed to track click: {e}")
            
        return tracking_id


class RevenueCalculator:
    COMMISSION_RATES = {
        'flight': 0.03,  # 3%
        'hotel': 0.05,   # 5%
        'activity': 0.10 # 10%
    }
    
    CONVERSION_RATE = 0.08  # ~8% of clicks convert on average
    
    def get_avg_booking_value(self, link_type: str) -> float:
        """Average booking value in INR"""
        averages = {
            'flight': 8000.0,
            'hotel': 6000.0,
            'activity': 2000.0
        }
        return averages.get(link_type.lower(), 5000.0)

    def estimate_single_click(self, link_type: str) -> float:
        """Estimates the probabilistic value of a single click."""
        avg_value = self.get_avg_booking_value(link_type)
        commission_rate = self.COMMISSION_RATES.get(link_type.lower(), 0.05)
        
        # Expected Value = Value * Conversion Rate * Commission Rate
        return avg_value * self.CONVERSION_RATE * commission_rate

    def estimate_total_revenue(self, clicks_data: list) -> float:
        """Estimates total revenue from a list of clicks."""
        # Typically you'd query the DB directly, this accepts raw BookingClick models or dicts
        return sum(click.estimated_revenue if hasattr(click, 'estimated_revenue') else click.get('estimated_revenue', 0.0) for click in clicks_data)


# Partner Configuration
PARTNERS = {
    "makemytrip": {
        "base_url": "https://www.makemytrip.com/search",
        "affiliate_param": "aff_id",
        "affiliate_id": "altairgo_mmt_123"
    },
    "booking": {
        "base_url": "https://www.booking.com/searchresults.html",
        "affiliate_param": "aid",
        "affiliate_id": "898989"
    }
}

# Singleton Instances
url_builder = AffiliateURLBuilder(PARTNERS)
tracker = ClickTracker()
revenue_calc = RevenueCalculator()
