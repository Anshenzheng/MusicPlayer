import sys
sys.path.insert(0, '.')

from app import app

print("Testing Flask app...")
print(f"App name: {app.name}")
print(f"Number of routes: {len(app.url_map._rules)}")

print("\nRoutes:")
for rule in app.url_map.iter_rules():
    print(f"  {rule} -> {rule.endpoint}")

print("\nApp is ready to run!")
