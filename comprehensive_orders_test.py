#!/usr/bin/env python3
"""
Comprehensive ROBOT Admin Panel Orders API Testing Suite

This script tests all Orders API endpoints with the correct schema
based on the actual backend implementation discovered.
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

# Test Data for Orders (using correct schema)
TEST_ORDER_CREATE = {
    "customer": {
        "name": "Олександр Петренко",
        "phone": "+380671234567",
        "email": "oleksandr.petrenko@example.com"
    },
    "items": [
        {
            "item_id": str(uuid.uuid4()),
            "name": {
                "ua": "Борщ українській",
                "pl": "Barszcz ukraiński", 
                "en": "Ukrainian Borscht"
            },
            "price": 45.50,
            "packaging_price": 2.00,
            "quantity": 2,
            "subtotal": 95.00  # (45.50 + 2.00) * 2
        },
        {
            "item_id": str(uuid.uuid4()),
            "name": {
                "ua": "Хліб чорний",
                "pl": "Chleb czarny",
                "en": "Black Bread"
            },
            "price": 15.00,
            "packaging_price": 1.00,
            "quantity": 1,
            "subtotal": 16.00  # (15.00 + 1.00) * 1
        }
    ],
    "location_id": "loc_1",  # Using the actual location ID
    "delivery": {
        "type": "courier",
        "address": "вул. Хрещатик, 1, Київ, 01001",
        "delivery_fee": 25.00,
        "estimated_time": "45 хвилин"
    },
    "subtotal": 111.00,  # Sum of item subtotals
    "delivery_fee": 25.00,
    "total": 136.00,  # subtotal + delivery_fee
    "notes": "Дзвонити за 10 хвилин до прибуття. Домофон не працює."
}

# Test data for pickup order
TEST_PICKUP_ORDER = {
    "customer": {
        "name": "Марія Іваненко",
        "phone": "+380501234567"
    },
    "items": [
        {
            "item_id": str(uuid.uuid4()),
            "name": {
                "ua": "Піца Маргарита",
                "pl": "Pizza Margherita",
                "en": "Margherita Pizza"
            },
            "price": 120.00,
            "quantity": 1,
            "subtotal": 120.00
        }
    ],
    "location_id": "loc_1",
    "delivery": {
        "type": "pickup",
        "delivery_fee": 0.0
    },
    "subtotal": 120.00,
    "delivery_fee": 0.00,
    "total": 120.00,
    "notes": "Самовивіз о 18:00"
}

@dataclass
class TestResult:
    endpoint: str
    method: str
    success: bool
    status_code: int
    response_data: Any
    error_message: Optional[str] = None
    execution_time: float = 0.0

class ComprehensiveOrdersTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results: List[TestResult] = []
        self.created_order_ids: List[str] = []
        
    def log_result(self, result: TestResult):
        """Log test result and print status"""
        self.test_results.append(result)
        status = "✅ PASS" if result.success else "❌ FAIL"
        print(f"{status} {result.method} {result.endpoint} ({result.status_code}) - {result.execution_time:.3f}s")
        if result.error_message:
            print(f"   Error: {result.error_message}")
        if result.success and result.response_data:
            if isinstance(result.response_data, dict):
                if 'id' in result.response_data:
                    print(f"   Order ID: {result.response_data['id']}")
                if 'order_number' in result.response_data:
                    print(f"   Order Number: {result.response_data['order_number']}")
            elif isinstance(result.response_data, list):
                print(f"   Response: Array with {len(result.response_data)} items")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, expect_success: bool = True) -> TestResult:
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
                timeout=30
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
                if isinstance(response_data, dict) and 'detail' in response_data:
                    if isinstance(response_data['detail'], list):
                        # Validation errors
                        error_message = f"Validation errors: {len(response_data['detail'])} issues"
                        for error in response_data['detail'][:3]:  # Show first 3 errors
                            print(f"     - {error.get('loc', [])}: {error.get('msg', '')}")
                    else:
                        error_message = response_data['detail']
                elif isinstance(response_data, dict) and 'message' in response_data:
                    error_message = response_data['message']
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
    
    def test_backend_health(self):
        """Test backend health and connectivity"""
        print("\n🏥 Testing Backend Health & Connectivity...")
        
        # Test health endpoint
        result = self.make_request("GET", "/health")
        self.log_result(result)
        
        # Test OpenAPI documentation
        result = self.make_request("GET", "/openapi.json")
        self.log_result(result)
        
        # Test API documentation page
        result = self.make_request("GET", "/docs")
        self.log_result(result)
    
    def test_orders_basic_operations(self):
        """Test basic Orders API operations"""
        print("\n📋 Testing Orders Basic Operations...")
        
        # Test GET /orders (list orders)
        result = self.make_request("GET", "/orders")
        self.log_result(result)
        
        # Test GET /orders with limit parameter
        result = self.make_request("GET", "/orders?limit=10")
        self.log_result(result)
        
        # Test GET /orders with location filter
        result = self.make_request("GET", "/orders?location_id=loc_1")
        self.log_result(result)
    
    def test_order_creation(self):
        """Test order creation with different scenarios"""
        print("\n🆕 Testing Order Creation...")
        
        # Test creating delivery order
        result = self.make_request("POST", "/orders", TEST_ORDER_CREATE)
        self.log_result(result)
        
        if result.success and result.response_data and 'id' in result.response_data:
            self.created_order_ids.append(result.response_data['id'])
        
        # Test creating pickup order
        result = self.make_request("POST", "/orders", TEST_PICKUP_ORDER)
        self.log_result(result)
        
        if result.success and result.response_data and 'id' in result.response_data:
            self.created_order_ids.append(result.response_data['id'])
        
        # Test creating order with minimal data
        minimal_order = {
            "customer": {
                "name": "Тест Користувач",
                "phone": "+380991234567"
            },
            "items": [
                {
                    "item_id": str(uuid.uuid4()),
                    "name": {
                        "ua": "Тестовий товар",
                        "pl": "Produkt testowy",
                        "en": "Test Product"
                    },
                    "price": 50.00,
                    "quantity": 1,
                    "subtotal": 50.00
                }
            ],
            "location_id": "loc_1",
            "delivery": {
                "type": "pickup"
            },
            "subtotal": 50.00,
            "delivery_fee": 0.00,
            "total": 50.00
        }
        
        result = self.make_request("POST", "/orders", minimal_order)
        self.log_result(result)
        
        if result.success and result.response_data and 'id' in result.response_data:
            self.created_order_ids.append(result.response_data['id'])
    
    def test_order_status_filtering(self):
        """Test order filtering by status (using English statuses)"""
        print("\n🔍 Testing Order Status Filtering...")
        
        # Test filtering by each valid status
        valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
        
        for status in valid_statuses:
            result = self.make_request("GET", f"/orders?status={status}")
            self.log_result(result)
    
    def test_individual_order_operations(self):
        """Test operations on individual orders"""
        print("\n🔧 Testing Individual Order Operations...")
        
        # Test getting individual orders
        for order_id in self.created_order_ids[:2]:  # Test first 2 orders
            result = self.make_request("GET", f"/orders/{order_id}")
            self.log_result(result)
        
        # Test updating order status
        if self.created_order_ids:
            order_id = self.created_order_ids[0]
            
            # Update to confirmed
            status_update = {"status": "confirmed"}
            result = self.make_request("PATCH", f"/orders/{order_id}/status", status_update)
            self.log_result(result)
            
            # Update to preparing
            status_update = {"status": "preparing"}
            result = self.make_request("PATCH", f"/orders/{order_id}/status", status_update)
            self.log_result(result)
            
            # Update to ready
            status_update = {"status": "ready"}
            result = self.make_request("PATCH", f"/orders/{order_id}/status", status_update)
            self.log_result(result)
    
    def test_orders_statistics(self):
        """Test orders statistics endpoint"""
        print("\n📊 Testing Orders Statistics...")
        
        result = self.make_request("GET", "/orders/stats/summary")
        self.log_result(result)
    
    def test_error_handling(self):
        """Test error handling and validation"""
        print("\n⚠️ Testing Error Handling & Validation...")
        
        # Test invalid order creation (missing required fields)
        invalid_order = {
            "customer": {
                "name": "Test User"
                # Missing phone
            },
            "items": []  # Empty items
        }
        result = self.make_request("POST", "/orders", invalid_order, expect_success=False)
        self.log_result(result)
        
        # Test invalid status filter
        result = self.make_request("GET", "/orders?status=invalid_status", expect_success=False)
        self.log_result(result)
        
        # Test non-existent order
        fake_id = str(uuid.uuid4())
        result = self.make_request("GET", f"/orders/{fake_id}", expect_success=False)
        self.log_result(result)
        
        # Test invalid status update
        if self.created_order_ids:
            invalid_status = {"status": "invalid_status"}
            result = self.make_request("PATCH", f"/orders/{self.created_order_ids[0]}/status", 
                                     invalid_status, expect_success=False)
            self.log_result(result)
    
    def test_authentication_requirements(self):
        """Test authentication requirements"""
        print("\n🔐 Testing Authentication Requirements...")
        
        # Save current auth token
        old_token = self.auth_token
        
        # Test without authentication
        self.auth_token = None
        result = self.make_request("GET", "/orders")
        self.log_result(result)
        
        # Test with invalid token
        self.auth_token = "invalid_token_12345"
        result = self.make_request("GET", "/orders")
        self.log_result(result)
        
        # Restore auth token
        self.auth_token = old_token
    
    def test_performance_and_load(self):
        """Test performance with multiple requests"""
        print("\n⚡ Testing Performance & Load...")
        
        start_time = time.time()
        
        # Make multiple concurrent-like requests
        for i in range(5):
            result = self.make_request("GET", "/orders?limit=5")
            if not result.success:
                break
        
        total_time = time.time() - start_time
        avg_time = total_time / 5
        
        print(f"   📈 Performance: 5 requests in {total_time:.2f}s (avg: {avg_time:.3f}s per request)")
        
        # Test with larger limit
        result = self.make_request("GET", "/orders?limit=100")
        self.log_result(result)
    
    def test_data_integrity(self):
        """Test data integrity and persistence"""
        print("\n🔒 Testing Data Integrity & Persistence...")
        
        if self.created_order_ids:
            order_id = self.created_order_ids[0]
            
            # Get order details
            result1 = self.make_request("GET", f"/orders/{order_id}")
            self.log_result(result1)
            
            if result1.success:
                original_data = result1.response_data
                
                # Wait a moment and get again to check persistence
                time.sleep(1)
                result2 = self.make_request("GET", f"/orders/{order_id}")
                self.log_result(result2)
                
                if result2.success:
                    # Check if data is consistent
                    if original_data.get('id') == result2.response_data.get('id'):
                        print("   ✅ Data persistence verified")
                    else:
                        print("   ❌ Data persistence issue detected")
    
    def cleanup_test_data(self):
        """Clean up created test orders"""
        print("\n🧹 Cleaning up test data...")
        
        for order_id in self.created_order_ids:
            result = self.make_request("DELETE", f"/orders/{order_id}")
            self.log_result(result)
    
    def run_comprehensive_tests(self):
        """Run all comprehensive Orders API tests"""
        print("🤖 Starting Comprehensive ROBOT Orders API Testing")
        print(f"🌐 Testing API at: {API_BASE}")
        print(f"📅 Test started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        start_time = time.time()
        
        try:
            self.test_backend_health()
            self.test_orders_basic_operations()
            self.test_order_creation()
            self.test_order_status_filtering()
            self.test_individual_order_operations()
            self.test_orders_statistics()
            self.test_error_handling()
            self.test_authentication_requirements()
            self.test_performance_and_load()
            self.test_data_integrity()
        except Exception as e:
            print(f"❌ Test execution error: {str(e)}")
        finally:
            self.cleanup_test_data()
        
        total_time = time.time() - start_time
        
        # Print comprehensive summary
        print(f"\n📊 Comprehensive Orders API Test Summary")
        print(f"⏱️ Total execution time: {total_time:.2f}s")
        
        passed = sum(1 for r in self.test_results if r.success)
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Analyze Orders API functionality
        orders_get_working = any(r.success and r.endpoint == "/orders" and r.method == "GET" 
                               for r in self.test_results)
        orders_create_working = any(r.success and r.endpoint == "/orders" and r.method == "POST" 
                                  for r in self.test_results)
        orders_status_working = any(r.success and "/status" in r.endpoint and r.method == "PATCH" 
                                  for r in self.test_results)
        orders_filtering_working = any(r.success and "?" in r.endpoint and r.method == "GET" 
                                     for r in self.test_results)
        
        print(f"\n📋 Orders API Functionality Analysis:")
        print(f"   📥 Orders retrieval (GET): {'✅ WORKING' if orders_get_working else '❌ FAILED'}")
        print(f"   📝 Order creation (POST): {'✅ WORKING' if orders_create_working else '❌ FAILED'}")
        print(f"   🔄 Status updates (PATCH): {'✅ WORKING' if orders_status_working else '❌ FAILED'}")
        print(f"   🔍 Filtering & search: {'✅ WORKING' if orders_filtering_working else '❌ FAILED'}")
        
        # Performance analysis
        response_times = [r.execution_time for r in self.test_results if r.success]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            print(f"\n⚡ Performance Analysis:")
            print(f"   📊 Average response time: {avg_response_time:.3f}s")
            print(f"   📊 Maximum response time: {max_response_time:.3f}s")
            print(f"   📊 Performance rating: {'🟢 EXCELLENT' if avg_response_time < 0.1 else '🟡 GOOD' if avg_response_time < 0.5 else '🔴 NEEDS IMPROVEMENT'}")
        
        if failed > 0:
            print(f"\n❌ Failed Tests Summary:")
            for result in self.test_results:
                if not result.success:
                    print(f"   {result.method} {result.endpoint}: {result.error_message}")
        
        # Final assessment
        print(f"\n🎯 Final Assessment:")
        if passed >= len(self.test_results) * 0.9:
            print("✅ Orders API is fully functional and production-ready")
        elif passed >= len(self.test_results) * 0.7:
            print("⚠️ Orders API is mostly functional with minor issues")
        elif orders_get_working and orders_create_working:
            print("🔶 Orders API core functionality works but has significant issues")
        else:
            print("❌ Orders API has critical issues and needs major fixes")
        
        return passed, failed, {
            'get_working': orders_get_working,
            'create_working': orders_create_working,
            'status_working': orders_status_working,
            'filtering_working': orders_filtering_working,
            'avg_response_time': sum(response_times) / len(response_times) if response_times else 0
        }

def main():
    """Main test execution"""
    tester = ComprehensiveOrdersTester()
    passed, failed, analysis = tester.run_comprehensive_tests()
    
    print(f"\n🏁 Test Execution Complete")
    print(f"📊 Results: {passed} passed, {failed} failed")
    
    return passed, failed, analysis

if __name__ == "__main__":
    main()