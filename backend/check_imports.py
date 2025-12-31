import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

try:
    print("Importing app...")
    from app.main import app
    print("Import successful!")
    
    print("Testing calculations import...")
    from app.core.calculations import calculate_blended_cost_rate
    print("Calculations import successful!")
    
    print("Testing models import...")
    from app.models.organization import Organization
    print("Organization model import successful!")
    
except Exception as e:
    print(f"Error during import: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
