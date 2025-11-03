"""
Test script to verify Lectra backend setup and functionality
"""
import os
import sys
import requests
import json
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_health_check():
    """Test the health check endpoint"""
    print_section("Testing Health Check Endpoint")
    
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"   Status: {data.get('status')}")
            print(f"   Pinecone Connected: {data.get('pinecone_connected')}")
            
            if 'index_stats' in data:
                stats = data['index_stats']
                print(f"   Total Vectors: {stats.get('total_vectors', 0)}")
                print(f"   Dimension: {stats.get('dimension', 0)}")
            
            return True
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running?")
        print("   Run: python main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print_section("Testing Root Endpoint")
    
    try:
        response = requests.get("http://localhost:8000/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Root endpoint working!")
            print(f"   Message: {data.get('message')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Root endpoint failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_environment_variables():
    """Test if required environment variables are set"""
    print_section("Testing Environment Variables")
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "PINECONE_API_KEY",
    ]
    
    optional_vars = [
        "OPENAI_API_KEY",
        "EMBEDDING_MODEL",
        "PINECONE_INDEX_NAME"
    ]
    
    all_good = True
    
    print("\nRequired Variables:")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"   ✅ {var}: {'*' * 10} (set)")
        else:
            print(f"   ❌ {var}: Not set")
            all_good = False
    
    print("\nOptional Variables:")
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"   ✅ {var}: {value}")
        else:
            print(f"   ⚠️  {var}: Not set (using defaults)")
    
    return all_good

def test_ingest_endpoint_validation():
    """Test the ingest endpoint with invalid data"""
    print_section("Testing Ingest Endpoint Validation")
    
    try:
        # Test with invalid data
        invalid_payload = {
            "file_url": "invalid-url",
            "user_id": "short"
        }
        
        response = requests.post(
            "http://localhost:8000/api/ingest",
            json=invalid_payload,
            timeout=10
        )
        
        if response.status_code == 422:
            print("✅ Validation working correctly!")
            print("   Server properly rejects invalid input")
            return True
        else:
            print(f"⚠️  Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def print_sample_curl_commands():
    """Print sample cURL commands for testing"""
    print_section("Sample cURL Commands")
    
    print("\n1. Health Check:")
    print("   curl http://localhost:8000/api/health")
    
    print("\n2. Ingest Document (replace with your values):")
    print('   curl -X POST http://localhost:8000/api/ingest \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"file_url": "YOUR_FILE_URL", "user_id": "YOUR_USER_ID"}\'')
    
    print("\n3. Delete Vectors:")
    print('   curl -X DELETE http://localhost:8000/api/vectors/USER_ID/FILE_NAME')

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  LECTRA BACKEND - TEST SUITE")
    print("=" * 60)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    results = {
        "Environment Variables": test_environment_variables(),
        "Root Endpoint": test_root_endpoint(),
        "Health Check": test_health_check(),
        "Input Validation": test_ingest_endpoint_validation(),
    }
    
    # Print summary
    print_section("Test Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\n   Total: {passed}/{total} tests passed")
    
    # Print sample commands
    print_sample_curl_commands()
    
    # Print next steps
    print_section("Next Steps")
    
    if passed == total:
        print("\n✅ All tests passed! Your backend is ready.")
        print("\n   To test document ingestion:")
        print("   1. Upload a PDF from your frontend")
        print("   2. Copy the file URL from Supabase Storage")
        print("   3. Use Postman or cURL to call /api/ingest")
        print("   4. Check Pinecone dashboard for vectors")
        print("\n   Documentation: See PHASE_2.md for detailed testing guide")
    else:
        print("\n⚠️  Some tests failed. Please check:")
        print("   1. Server is running (python main.py)")
        print("   2. .env file is configured correctly")
        print("   3. All required API keys are valid")
        print("\n   See PHASE_2.md for troubleshooting")
    
    print("\n" + "=" * 60 + "\n")

if __name__ == "__main__":
    main()
