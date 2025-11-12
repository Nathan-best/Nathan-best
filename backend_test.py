#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Robotics Maintenance Brokerage Platform
Tests authentication, job management, AI matching, payments, reviews, and admin features
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

class RoboticsMaintenanceAPITester:
    def __init__(self, base_url="https://robotix-connect.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        
        # Test tokens from MongoDB setup
        self.warehouse_token = "test_warehouse_session_1762914773839"
        self.tech_token = "test_tech_session_1762914773839"
        self.admin_token = "test_admin_session_1762914773839"
        
        # Test results tracking
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_data = {}

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, token: Optional[str] = None, 
                 headers: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if token:
            test_headers['Authorization'] = f'Bearer {token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Exception: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        # Test warehouse user auth
        success, user_data = self.run_test(
            "Warehouse User Auth",
            "GET",
            "auth/me",
            200,
            token=self.warehouse_token
        )
        if success and user_data:
            self.test_data['warehouse_user'] = user_data
            print(f"   Warehouse User: {user_data.get('name')} ({user_data.get('role')})")
        
        # Test technician user auth
        success, user_data = self.run_test(
            "Technician User Auth",
            "GET",
            "auth/me",
            200,
            token=self.tech_token
        )
        if success and user_data:
            self.test_data['tech_user'] = user_data
            print(f"   Tech User: {user_data.get('name')} ({user_data.get('role')})")
        
        # Test admin user auth
        success, user_data = self.run_test(
            "Admin User Auth",
            "GET",
            "auth/me",
            200,
            token=self.admin_token
        )
        if success and user_data:
            self.test_data['admin_user'] = user_data
            print(f"   Admin User: {user_data.get('name')} ({user_data.get('role')})")
        
        # Test unauthorized access
        self.run_test(
            "Unauthorized Access",
            "GET",
            "auth/me",
            401
        )

    def test_job_management(self):
        """Test job CRUD operations"""
        print("\n" + "="*50)
        print("TESTING JOB MANAGEMENT")
        print("="*50)
        
        # Test job creation (warehouse only)
        job_data = {
            "title": "Repair conveyor belt motor",
            "equipment_type": "Conveyor belt",
            "issue_description": "Motor making unusual noise and running slow",
            "location": "Inglewood, CA - Warehouse District",
            "urgency": "high",
            "budget": 750.00
        }
        
        success, created_job = self.run_test(
            "Create Job (Warehouse)",
            "POST",
            "jobs",
            200,
            data=job_data,
            token=self.warehouse_token
        )
        
        if success and created_job:
            self.test_data['test_job'] = created_job
            print(f"   Created Job ID: {created_job.get('id')}")
        
        # Test job creation by technician (should fail)
        self.run_test(
            "Create Job (Technician - Should Fail)",
            "POST",
            "jobs",
            403,
            data=job_data,
            token=self.tech_token
        )
        
        # Test get all jobs
        success, jobs = self.run_test(
            "Get All Jobs (Warehouse)",
            "GET",
            "jobs",
            200,
            token=self.warehouse_token
        )
        if success:
            print(f"   Found {len(jobs)} jobs for warehouse")
        
        success, jobs = self.run_test(
            "Get All Jobs (Technician)",
            "GET",
            "jobs",
            200,
            token=self.tech_token
        )
        if success:
            print(f"   Found {len(jobs)} available jobs for technician")
        
        # Test get specific job
        if 'test_job' in self.test_data:
            job_id = self.test_data['test_job']['id']
            success, job_details = self.run_test(
                "Get Job Details",
                "GET",
                f"jobs/{job_id}",
                200,
                token=self.warehouse_token
            )
            if success:
                print(f"   Job Status: {job_details.get('status')}")

    def test_job_workflow(self):
        """Test complete job workflow: accept -> complete"""
        print("\n" + "="*50)
        print("TESTING JOB WORKFLOW")
        print("="*50)
        
        if 'test_job' not in self.test_data:
            print("❌ No test job available for workflow testing")
            return
        
        job_id = self.test_data['test_job']['id']
        
        # Test job acceptance by technician
        success, _ = self.run_test(
            "Accept Job (Technician)",
            "POST",
            f"jobs/{job_id}/accept",
            200,
            token=self.tech_token
        )
        
        if success:
            # Verify job status changed
            success, job_details = self.run_test(
                "Verify Job Accepted",
                "GET",
                f"jobs/{job_id}",
                200,
                token=self.tech_token
            )
            if success:
                print(f"   Job Status: {job_details.get('status')}")
                print(f"   Assigned Tech: {job_details.get('assigned_tech_name')}")
        
        # Test job completion by technician
        success, _ = self.run_test(
            "Complete Job (Technician)",
            "POST",
            f"jobs/{job_id}/complete",
            200,
            token=self.tech_token
        )
        
        if success:
            # Verify job status changed
            success, job_details = self.run_test(
                "Verify Job Completed",
                "GET",
                f"jobs/{job_id}",
                200,
                token=self.warehouse_token
            )
            if success:
                print(f"   Job Status: {job_details.get('status')}")
                self.test_data['completed_job'] = job_details

    def test_ai_matching(self):
        """Test AI-powered technician matching"""
        print("\n" + "="*50)
        print("TESTING AI MATCHING")
        print("="*50)
        
        if 'test_job' not in self.test_data:
            print("❌ No test job available for AI matching")
            return
        
        job_id = self.test_data['test_job']['id']
        
        # Test AI matching (warehouse only)
        success, matches = self.run_test(
            "Get AI Matches (Warehouse)",
            "GET",
            f"jobs/{job_id}/matches",
            200,
            token=self.warehouse_token
        )
        
        if success and matches:
            print(f"   AI Recommendation: {matches.get('ai_recommendation', 'N/A')[:100]}...")
            technicians = matches.get('technicians', [])
            print(f"   Available Technicians: {len(technicians)}")
            for tech in technicians[:3]:  # Show first 3
                print(f"     - {tech.get('name')} (Rating: {tech.get('rating', 0)}/5)")
        
        # Test AI matching by technician (should fail)
        self.run_test(
            "Get AI Matches (Technician - Should Fail)",
            "GET",
            f"jobs/{job_id}/matches",
            403,
            token=self.tech_token
        )

    def test_payment_flow(self):
        """Test Stripe payment integration"""
        print("\n" + "="*50)
        print("TESTING PAYMENT FLOW")
        print("="*50)
        
        if 'completed_job' not in self.test_data:
            print("❌ No completed job available for payment testing")
            return
        
        job_id = self.test_data['completed_job']['id']
        
        # Test checkout session creation
        checkout_data = {
            "job_id": job_id,
            "origin_url": "https://robotix-connect.preview.emergentagent.com"
        }
        
        success, checkout_response = self.run_test(
            "Create Checkout Session",
            "POST",
            "payments/checkout",
            200,
            data=checkout_data,
            token=self.warehouse_token
        )
        
        if success and checkout_response:
            session_id = checkout_response.get('session_id')
            checkout_url = checkout_response.get('checkout_url')
            print(f"   Session ID: {session_id}")
            print(f"   Checkout URL: {checkout_url[:50]}...")
            
            if session_id:
                self.test_data['payment_session_id'] = session_id
                
                # Test payment status check
                success, status = self.run_test(
                    "Check Payment Status",
                    "GET",
                    f"payments/status/{session_id}",
                    200,
                    token=self.warehouse_token
                )
                
                if success:
                    print(f"   Payment Status: {status.get('payment_status', 'unknown')}")
        
        # Test payment by technician (should fail)
        self.run_test(
            "Create Checkout (Technician - Should Fail)",
            "POST",
            "payments/checkout",
            403,
            data=checkout_data,
            token=self.tech_token
        )

    def test_review_system(self):
        """Test review and rating system"""
        print("\n" + "="*50)
        print("TESTING REVIEW SYSTEM")
        print("="*50)
        
        if 'completed_job' not in self.test_data:
            print("❌ No completed job available for review testing")
            return
        
        job_id = self.test_data['completed_job']['id']
        tech_id = self.test_data['completed_job'].get('assigned_tech_id')
        warehouse_id = self.test_data['completed_job'].get('warehouse_id')
        
        # Test warehouse reviewing technician
        review_data = {
            "job_id": job_id,
            "reviewee_id": tech_id,
            "rating": 5,
            "comment": "Excellent work! Fixed the conveyor belt quickly and professionally."
        }
        
        success, review = self.run_test(
            "Create Review (Warehouse -> Tech)",
            "POST",
            "reviews",
            200,
            data=review_data,
            token=self.warehouse_token
        )
        
        if success:
            print(f"   Review ID: {review.get('id')}")
            print(f"   Rating: {review.get('rating')}/5")
        
        # Test technician reviewing warehouse
        review_data = {
            "job_id": job_id,
            "reviewee_id": warehouse_id,
            "rating": 4,
            "comment": "Good communication and clear job description. Payment was prompt."
        }
        
        success, review = self.run_test(
            "Create Review (Tech -> Warehouse)",
            "POST",
            "reviews",
            200,
            data=review_data,
            token=self.tech_token
        )
        
        # Test get user reviews
        if tech_id:
            success, reviews = self.run_test(
                "Get Technician Reviews",
                "GET",
                f"reviews/{tech_id}",
                200
            )
            if success:
                print(f"   Technician has {len(reviews)} reviews")

    def test_admin_features(self):
        """Test admin-only features"""
        print("\n" + "="*50)
        print("TESTING ADMIN FEATURES")
        print("="*50)
        
        # Test admin stats
        success, stats = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200,
            token=self.admin_token
        )
        
        if success and stats:
            print(f"   Total Jobs: {stats.get('total_jobs', 0)}")
            print(f"   Total Users: {stats.get('total_users', 0)}")
            print(f"   Verified Techs: {stats.get('verified_technicians', 0)}")
            print(f"   Platform Revenue: ${stats.get('total_platform_revenue', 0):.2f}")
        
        # Test admin stats by non-admin (should fail)
        self.run_test(
            "Get Admin Stats (Warehouse - Should Fail)",
            "GET",
            "admin/stats",
            403,
            token=self.warehouse_token
        )
        
        # Test technician verification
        if 'tech_user' in self.test_data:
            tech_id = self.test_data['tech_user']['id']
            success, _ = self.run_test(
                "Verify Technician",
                "POST",
                f"admin/verify-tech/{tech_id}",
                200,
                token=self.admin_token
            )
        
        # Test get all technicians
        success, technicians = self.run_test(
            "Get All Technicians",
            "GET",
            "technicians",
            200
        )
        
        if success:
            print(f"   Total Technicians: {len(technicians)}")
            verified_count = sum(1 for tech in technicians if tech.get('verified'))
            print(f"   Verified Technicians: {verified_count}")

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Robotics Maintenance Platform API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print(f"📅 Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        start_time = time.time()
        
        # Run test suites in order
        self.test_authentication()
        self.test_job_management()
        self.test_job_workflow()
        self.test_ai_matching()
        self.test_payment_flow()
        self.test_review_system()
        self.test_admin_features()
        
        # Print final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "="*60)
        print("FINAL TEST RESULTS")
        print("="*60)
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print(f"⏱️  Duration: {duration:.2f} seconds")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"   {i}. {failure['test']}")
                if 'expected' in failure:
                    print(f"      Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'error' in failure:
                    print(f"      Error: {failure['error']}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    tester = RoboticsMaintenanceAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())