#!/usr/bin/env python3
"""
ROBOT Admin Panel Orders API Comprehensive Testing Suite

This script tests the Orders API functionality after recent backend updates
to verify if Orders endpoints have been implemented and are working correctly.
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

# API Configuration
BASE_URL = "https://robot-api-app-cc4d4f828ab6.herokuapp.com"
API_BASE = BASE_URL

# Test Data for Orders with Ukrainian statuses
TEST_ORDER_CREATE = {
    "tenant_id": str(uuid.uuid4()),
    "source": "resto",
    "status": "нове",
    "payment_status": "неоплачено", 
    "total_amount": 125.50,
    "order_time": "2024-01-15T14:30:00Z",
    "delivery_type": "доставка",
    "customer": {
        "name": "Олександр Петренко",
        "phone": "+380671234567",
        "address": "вул. Хрещатик, 1, Київ"
    },
    "items": [
        {
            "item_id": str(uuid.uuid4()),
            "item_name": {
                "ua": "Борщ українській",
                "pl": "Barszcz ukraiński", 
                "en": "Ukrainian Borscht",
                "by": "Украінскі борш"
            },
            "quantity": 2,
            "price": 45.50,
            "total": 91.00
        },
        {
            "item_id": str(uuid.uuid4()),
            "item_name": {
                "ua": "Вареники з картоплею",
                "pl": "Pierogi z ziemniakami",
                "en": "Potato Dumplings", 
                "by": "Вареннікі з бульбай"
            },
            "quantity": 1,
            "price": 34.50,
            "total": 34.50
        }
    ],
    "delivery_info": {
        "address": "вул. Хрещатик, 1, Київ",
        "phone": "+380671234567",
        "delivery_time": "2024-01-15T16:00:00Z",
        "notes": "Дзвонити за 10 хвилин до прибуття"
    }
}

# Ukrainian status test data
UKRAINIAN_STATUSES = ["нове", "у реалізації", "виконано"]
ORDER_SOURCES = ["resto", "telegram", "glovo", "bolt", "wolt", "custom"]

@dataclass
class TestResult:
    endpoint: str
    method: str
    success: bool
    status_code: int
    response_data: Any
    error_message: Optional[str] = None
    execution_time: float = 0.0

class OrdersApiComprehensiveTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results: List[TestResult] = []
        self.created_order_id = None
        self.backend_accessible = False
        
    def log_result(self, result: TestResult):
        """Log test result and print status"""
        self.test_results.append(result)
        status = "✅ PASS" if result.success else "❌ FAIL"
        print(f"{status} {result.method} {result.endpoint} ({result.status_code}) - {result.execution_time:.3f}s")
        if result.error_message:
            print(f"   Error: {result.error_message}")
        if result.success and result.response_data:
            if isinstance(result.response_data, dict):
                print(f"   Response keys: {list(result.response_data.keys())}")
            elif isinstance(result.response_data, list):
                print(f"   Response: Array with {len(result.response_data)} items")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, expect_success: bool = True, timeout: int = 10) -> TestResult:
        """Make HTTP request and return test result"""
        start_time = time.time()
        
        # Prepare headers
        request_headers = {"Content-Type": "application/json"}
        if self.auth_token:
            request_headers["Authorization"] = f"Bearer {self.auth_token}"
        if headers:
            request_headers.update(headers)
        
        # Make request
        try:
            url = f"{API_BASE}{endpoint}"
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                headers=request_headers,
                timeout=timeout
            )
            
            execution_time = time.time() - start_time
            
            # Parse response
            try:
                response_data = response.json() if response.text else None
            except json.JSONDecodeError:
                response_data = response.text
            
            # Determine success
            if expect_success:
                success = response.status_code < 400
            else:
                success = response.status_code >= 400
            
            error_message = None
            if not success:
                if isinstance(response_data, dict) and 'message' in response_data:
                    error_message = response_data['message']
                elif isinstance(response_data, dict) and 'detail' in response_data:
                    error_message = response_data['detail']
                else:
                    error_message = f"HTTP {response.status_code}: {response.reason}"
            
            return TestResult(
                endpoint=endpoint,
                method=method,
                success=success,
                status_code=response.status_code,
                response_data=response_data,
                error_message=error_message,
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            return TestResult(
                endpoint=endpoint,
                method=method,
                success=False,
                status_code=0,
                response_data=None,
                error_message=str(e),
                execution_time=execution_time
            )
    
    def test_backend_connectivity(self):
        """Test backend connectivity and health"""
        print("\n🏥 Testing Backend Connectivity...")
        
        # Test health endpoint
        result = self.make_request("GET", "/health", timeout=5)
        self.log_result(result)
        
        if result.success:
            self.backend_accessible = True
            print("   ✅ Backend is accessible and healthy")
        else:
            print("   ❌ Backend is not accessible or unhealthy")
            
        # Test API documentation endpoint
        result = self.make_request("GET", "/docs", timeout=5)
        self.log_result(result)
        
        # Test OpenAPI schema
        result = self.make_request("GET", "/openapi.json", timeout=5)
        self.log_result(result)
        
        return self.backend_accessible
    
    def test_orders_api_endpoints(self):
        """Test Orders API endpoints implementation"""
        print("\n📋 Testing Orders API Endpoints...")
        
        # Test GET /orders (basic retrieval)
        result = self.make_request("GET", "/orders")
        self.log_result(result)
        
        # Test GET /api/orders (with /api prefix)
        result = self.make_request("GET", "/api/orders")
        self.log_result(result)
        
        # Test POST /orders (create new order)
        result = self.make_request("POST", "/orders", TEST_ORDER_CREATE)
        self.log_result(result)
        
        if result.success and result.response_data:
            if isinstance(result.response_data, dict) and 'id' in result.response_data:
                self.created_order_id = result.response_data['id']
                print(f"   📝 Created order ID: {self.created_order_id}")
        
        # Test POST /api/orders (with /api prefix)
        if not self.created_order_id:
            result = self.make_request("POST", "/api/orders", TEST_ORDER_CREATE)
            self.log_result(result)
            
            if result.success and result.response_data:
                if isinstance(result.response_data, dict) and 'id' in result.response_data:
                    self.created_order_id = result.response_data['id']
                    print(f"   📝 Created order ID (via /api): {self.created_order_id}")
    
    def test_orders_filtering(self):
        """Test Orders API filtering capabilities"""
        print("\n🔍 Testing Orders API Filtering...")
        
        # Test filtering by Ukrainian statuses
        for status in UKRAINIAN_STATUSES:
            result = self.make_request("GET", f"/orders?status={status}")
            self.log_result(result)
            
            result = self.make_request("GET", f"/api/orders?status={status}")
            self.log_result(result)
        
        # Test filtering by source
        for source in ORDER_SOURCES:
            result = self.make_request("GET", f"/orders?source={source}")
            self.log_result(result)
            
            result = self.make_request("GET", f"/api/orders?source={source}")
            self.log_result(result)
        
        # Test date range filtering
        result = self.make_request("GET", "/orders?date_from=2024-01-01&date_to=2024-12-31")
        self.log_result(result)
        
        result = self.make_request("GET", "/api/orders?date_from=2024-01-01&date_to=2024-12-31")
        self.log_result(result)
        
        # Test combined filtering
        result = self.make_request("GET", "/orders?status=нове&source=resto&date_from=2024-01-01")
        self.log_result(result)
    
    def test_single_order_operations(self):
        """Test single order operations"""
        print("\n🔧 Testing Single Order Operations...")
        
        # Test GET single order (if we have an order ID)
        if self.created_order_id:
            result = self.make_request("GET", f"/orders/{self.created_order_id}")
            self.log_result(result)
            
            result = self.make_request("GET", f"/api/orders/{self.created_order_id}")
            self.log_result(result)
        
        # Test with a dummy UUID to check error handling
        dummy_id = str(uuid.uuid4())
        result = self.make_request("GET", f"/orders/{dummy_id}", expect_success=False)
        self.log_result(result)
        
        result = self.make_request("GET", f"/api/orders/{dummy_id}", expect_success=False)
        self.log_result(result)
    
    def test_order_status_updates(self):
        """Test order status updates with Ukrainian statuses"""
        print("\n🔄 Testing Order Status Updates...")
        
        if self.created_order_id:
            # Test each Ukrainian status update
            for status in UKRAINIAN_STATUSES:
                status_update = {"status": status}
                result = self.make_request("PATCH", f"/orders/{self.created_order_id}/status", status_update)
                self.log_result(result)
                
                result = self.make_request("PATCH", f"/api/orders/{self.created_order_id}/status", status_update)
                self.log_result(result)
        else:
            # Test with dummy ID
            dummy_id = str(uuid.uuid4())
            status_update = {"status": "у реалізації"}
            result = self.make_request("PATCH", f"/orders/{dummy_id}/status", status_update, expect_success=False)
            self.log_result(result)
    
    def test_order_data_validation(self):
        """Test order data validation"""
        print("\n✅ Testing Order Data Validation...")
        
        # Test Ukrainian delivery types
        delivery_types = ["доставка", "особистий відбір"]
        for delivery_type in delivery_types:
            test_order = {**TEST_ORDER_CREATE, "delivery_type": delivery_type}
            result = self.make_request("POST", "/orders", test_order)
            self.log_result(result)
        
        # Test Ukrainian payment statuses
        payment_statuses = ["оплачено", "неоплачено"]
        for payment_status in payment_statuses:
            test_order = {**TEST_ORDER_CREATE, "payment_status": payment_status}
            result = self.make_request("POST", "/orders", test_order)
            self.log_result(result)
        
        # Test I18n item names structure
        test_order_i18n = {**TEST_ORDER_CREATE}
        result = self.make_request("POST", "/orders", test_order_i18n)
        self.log_result(result)
    
    def test_authentication_requirements(self):
        """Test authentication requirements for orders endpoints"""
        print("\n🔐 Testing Authentication Requirements...")
        
        # Save current auth token
        old_token = self.auth_token
        
        # Test without authentication
        self.auth_token = None
        result = self.make_request("GET", "/orders")
        self.log_result(result)
        
        result = self.make_request("GET", "/api/orders")
        self.log_result(result)
        
        # Test with invalid token
        self.auth_token = "invalid_token_12345"
        result = self.make_request("GET", "/orders")
        self.log_result(result)
        
        result = self.make_request("GET", "/api/orders")
        self.log_result(result)
        
        # Restore auth token
        self.auth_token = old_token
    
    def test_existing_api_functionality(self):
        """Test existing API functionality to ensure it's still working"""
        print("\n🔄 Testing Existing API Functionality...")
        
        # Test categories endpoint (should exist from previous tests)
        result = self.make_request("GET", "/categories")
        self.log_result(result)
        
        # Test items endpoint
        result = self.make_request("GET", "/items")
        self.log_result(result)
        
        # Test locations endpoint
        result = self.make_request("GET", "/locations")
        self.log_result(result)
        
        # Test media endpoint
        result = self.make_request("POST", "/media/sign-upload", {})
        self.log_result(result)
    
    def analyze_orders_api_status(self):
        """Analyze the Orders API implementation status"""
        print("\n📊 Analyzing Orders API Status...")
        
        orders_endpoints_found = False
        orders_create_working = False
        orders_filtering_working = False
        orders_status_update_working = False
        ukrainian_status_support = False
        
        for result in self.test_results:
            if "/orders" in result.endpoint and result.success:
                if result.method == "GET" and "?" not in result.endpoint and result.endpoint.count("/") == 1:
                    orders_endpoints_found = True
                elif result.method == "POST" and result.endpoint.count("/") == 1:
                    orders_create_working = True
                elif result.method == "GET" and "?" in result.endpoint:
                    orders_filtering_working = True
                elif result.method == "PATCH" and "/status" in result.endpoint:
                    orders_status_update_working = True
                
                # Check for Ukrainian status support
                if any(status in str(result.response_data) for status in UKRAINIAN_STATUSES):
                    ukrainian_status_support = True
        
        print(f"   Orders endpoints exist: {'✅ YES' if orders_endpoints_found else '❌ NO'}")
        print(f"   Order creation working: {'✅ YES' if orders_create_working else '❌ NO'}")
        print(f"   Order filtering working: {'✅ YES' if orders_filtering_working else '❌ NO'}")
        print(f"   Status updates working: {'✅ YES' if orders_status_update_working else '❌ NO'}")
        print(f"   Ukrainian status support: {'✅ YES' if ukrainian_status_support else '❌ NO'}")
        
        return {
            "endpoints_found": orders_endpoints_found,
            "create_working": orders_create_working,
            "filtering_working": orders_filtering_working,
            "status_update_working": orders_status_update_working,
            "ukrainian_status_support": ukrainian_status_support
        }
    
    def run_comprehensive_orders_tests(self):
        """Run comprehensive Orders API tests"""
        print("📋 Starting ROBOT Admin Panel Orders API Comprehensive Tests")
        print(f"🌐 Testing API at: {API_BASE}")
        print("🎯 Focus: Orders API implementation after recent backend updates")
        
        start_time = time.time()
        
        try:
            # Test backend connectivity first
            if not self.test_backend_connectivity():
                print("❌ Backend is not accessible. Cannot proceed with Orders API testing.")
                return self.generate_summary(start_time)
            
            # Test existing functionality to ensure backend is working
            self.test_existing_api_functionality()
            
            # Test Orders API implementation
            self.test_orders_api_endpoints()
            self.test_orders_filtering()
            self.test_single_order_operations()
            self.test_order_status_updates()
            self.test_order_data_validation()
            self.test_authentication_requirements()
            
        except Exception as e:
            print(f"❌ Test execution error: {str(e)}")
        
        return self.generate_summary(start_time)
    
    def generate_summary(self, start_time):
        """Generate comprehensive test summary"""
        total_time = time.time() - start_time
        
        # Print summary
        print(f"\n📊 Orders API Comprehensive Test Summary")
        print(f"⏱️ Total execution time: {total_time:.2f}s")
        
        passed = sum(1 for r in self.test_results if r.success)
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success rate: {(passed/len(self.test_results)*100):.1f}%" if self.test_results else "No tests executed")
        
        # Analyze Orders API status
        orders_status = self.analyze_orders_api_status()
        
        if failed > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result.success:
                    print(f"   {result.method} {result.endpoint}: {result.error_message}")
        
        return {
            "passed": passed,
            "failed": failed,
            "total_time": total_time,
            "backend_accessible": self.backend_accessible,
            "orders_status": orders_status,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = OrdersApiComprehensiveTester()
    summary = tester.run_comprehensive_orders_tests()
    
    # Print final assessment
    print(f"\n🎯 Final Assessment:")
    if not summary["backend_accessible"]:
        print("❌ Backend is not accessible - Orders API testing cannot be completed")
    elif summary["orders_status"]["endpoints_found"] and summary["orders_status"]["create_working"]:
        print("✅ Orders API is implemented and functional")
    elif summary["orders_status"]["endpoints_found"]:
        print("⚠️ Orders API endpoints exist but may have issues")
    else:
        print("❌ Orders API endpoints not found - need to be implemented")
    
    return summary

if __name__ == "__main__":
    main()