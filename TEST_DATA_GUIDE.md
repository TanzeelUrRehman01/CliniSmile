# CliniSmile Application - Comprehensive Test Data Guide

## Table of Contents
1. Admin User Credentials
2. Doctor User Credentials
3. Patient User Credentials
4. Test Doctor Profiles
5. Test Appointments Data
6. Test Payments Data
7. Test Scenarios & Workflows
8. Edge Cases & Error Testing
9. Database Seeding Commands

---

## 1. ADMIN USER CREDENTIALS

### Super Admin Account
- **Email:** admin@clinismile.com
- **Password:** Admin@123456
- **Full Name:** Admin User
- **Phone:** +92-300-1234567
- **Role:** admin

### Secondary Admin Account
- **Email:** admin2@clinismile.com
- **Password:** SecureAdmin@2024
- **Full Name:** Secondary Admin
- **Phone:** +92-301-9876543
- **Role:** admin

---

## 2. DOCTOR USER CREDENTIALS

### Doctor 1 - Experienced Dentist
- **Email:** dr.ali@clinismile.com
- **Password:** DoctorAli@123
- **Full Name:** Dr. Muhammad Ali
- **Phone:** +92-300-5000001
- **PMDC License:** DEN-2015-0001
- **Specialization:** General Dentistry
- **Experience:** 8 years
- **City:** Karachi
- **Hospital/Clinic:** Ali Dental Clinic
- **License Image:** [Test image URL or path]
- **Verification Status:** verified

### Doctor 2 - Orthodontist
- **Email:** dr.sara@clinismile.com
- **Password:** DoctorSara@123
- **Full Name:** Dr. Sara Khan
- **Phone:** +92-300-5000002
- **PMDC License:** DEN-2018-0045
- **Specialization:** Orthodontics
- **Experience:** 5 years
- **City:** Lahore
- **Hospital/Clinic:** Khan Dental Care
- **License Image:** [Test image URL or path]
- **Verification Status:** verified

### Doctor 3 - Cosmetic Dentist
- **Email:** dr.fatima@clinismile.com
- **Password:** DoctorFatima@123
- **Full Name:** Dr. Fatima Ahmed
- **Phone:** +92-300-5000003
- **PMDC License:** DEN-2017-0078
- **Specialization:** Cosmetic Dentistry
- **Experience:** 6 years
- **City:** Islamabad
- **Hospital/Clinic:** Smile Makeover Studio
- **License Image:** [Test image URL or path]
- **Verification Status:** verified

### Doctor 4 - Pendulum Account (For Verification Test)
- **Email:** dr.unverified@clinismile.com
- **Password:** DoctorUnverified@123
- **Full Name:** Dr. Hassan Ahmed
- **Phone:** +92-300-5000004
- **PMDC License:** DEN-2020-0120
- **Specialization:** Periodontics
- **Experience:** 2 years
- **City:** Peshawar
- **Hospital/Clinic:** New Dental Clinic
- **License Image:** [Test image URL or path]
- **Verification Status:** pending

---

## 3. PATIENT USER CREDENTIALS

### Patient 1 - Regular User
- **Email:** patient1@clinismile.com
- **Password:** Patient@123
- **Full Name:** Ahmed Hassan
- **Phone:** +92-300-7000001
- **Age:** 28
- **Gender:** Male
- **City:** Karachi
- **Medical History:** No allergies

### Patient 2 - Female Patient
- **Email:** patient2@clinismile.com
- **Password:** Patient@123
- **Full Name:** Ayesha Khan
- **Phone:** +92-300-7000002
- **Age:** 32
- **Gender:** Female
- **City:** Lahore
- **Medical History:** Sensitive teeth

### Patient 3 - Minor Patient Account (For Testing)
- **Email:** patient3@clinismile.com
- **Password:** Patient@123
- **Full Name:** Ali Raza (Minor)
- **Phone:** +92-300-7000003
- **Age:** 15
- **Gender:** Male
- **City:** Islamabad
- **Medical History:** Requires parental consent

### Patient 4 - Premium Patient
- **Email:** premium@clinismile.com
- **Password:** Patient@123
- **Full Name:** Zainab Ali
- **Phone:** +92-300-7000004
- **Age:** 40
- **Gender:** Female
- **City:** Peshawar
- **Medical History:** Diabetic, requires special care

---

## 4. TEST DOCTOR PROFILES & AVAILABILITY

### Doctor 1 Availability - Dr. Muhammad Ali
**Clinic Location:** 
- Address: Al-Farooq Road, Karachi
- Latitude: 24.8607° N
- Longitude: 67.0011° E

**Available Slots (Weekly):**
- Monday: 9:00 AM - 5:00 PM (Slot duration: 30 mins)
- Tuesday: 10:00 AM - 6:00 PM
- Wednesday: 9:00 AM - 5:00 PM
- Thursday: 1:00 PM - 7:00 PM
- Friday: OFF
- Saturday: 10:00 AM - 4:00 PM
- Sunday: OFF

**Consultation Fee:** 3,000 PKR
**Location Images:** [Test images for clinic]

### Doctor 2 Availability - Dr. Sara Khan
**Clinic Location:**
- Address: Canal Road, Lahore
- Latitude: 31.5204° N
- Longitude: 74.3587° E

**Available Slots (Weekly):**
- Monday: OFF
- Tuesday: 11:00 AM - 7:00 PM (Slot duration: 45 mins)
- Wednesday: 11:00 AM - 7:00 PM
- Thursday: 11:00 AM - 7:00 PM
- Friday: 11:00 AM - 5:00 PM
- Saturday: 11:00 AM - 5:00 PM
- Sunday: OFF

**Consultation Fee:** 4,500 PKR
**Location Images:** [Test images for clinic]

---

## 5. TEST APPOINTMENTS DATA

### Appointment 1 - Completed (History Testing)
- **Patient:** Ahmed Hassan (patient1@clinismile.com)
- **Doctor:** Dr. Muhammad Ali
- **Date:** 2026-04-15
- **Time:** 10:00 AM
- **Status:** completed
- **Symptom:** Tooth pain
- **Notes:** Root canal treatment performed
- **AI Verdict:** Required professional treatment ✓

### Appointment 2 - Upcoming
- **Patient:** Ayesha Khan (patient2@clinismile.com)
- **Doctor:** Dr. Sara Khan
- **Date:** 2026-04-28
- **Time:** 2:00 PM
- **Status:** confirmed
- **Symptom:** Teeth whitening inquiry
- **Notes:** Patient interested in cosmetic procedures
- **AI Verdict:** Can be handled by specialist

### Appointment 3 - Pending Confirmation
- **Patient:** Ahmed Hassan (patient1@clinismile.com)
- **Doctor:** Dr. Fatima Ahmed
- **Date:** 2026-04-29
- **Time:** 3:00 PM
- **Status:** pending
- **Symptom:** General checkup
- **Notes:** Annual dental checkup
- **AI Verdict:** General consultation required

### Appointment 4 - Cancelled (For Testing)
- **Patient:** Zainab Ali (premium@clinismile.com)
- **Doctor:** Dr. Muhammad Ali
- **Date:** 2026-04-20
- **Time:** 11:00 AM
- **Status:** cancelled
- **Symptom:** Gum disease
- **Cancellation Reason:** Patient rescheduled
- **Cancelled By:** Patient
- **Cancellation Date:** 2026-04-19

### Appointment 5 - No-Show (For Testing)
- **Patient:** Ali Raza (patient3@clinismile.com)
- **Doctor:** Dr. Sara Khan
- **Date:** 2026-04-22
- **Time:** 4:00 PM
- **Status:** completed
- **No-show:** Yes
- **Notes:** Patient did not attend appointment

---

## 6. TEST PAYMENTS DATA

### Payment 1 - Successful Payment
- **Appointment ID:** AP-001
- **Patient:** Ahmed Hassan
- **Doctor:** Dr. Muhammad Ali
- **Amount:** 3,000 PKR
- **Payment Date:** 2026-04-15
- **Payment Method:** jazzcash
- **Payment Reference:** JCH-2026-04-15-001
- **Status:** completed
- **Transaction ID:** TXN-123456789

### Payment 2 - Failed Payment (For Testing)
- **Appointment ID:** AP-002
- **Patient:** Ayesha Khan
- **Doctor:** Dr. Sara Khan
- **Amount:** 4,500 PKR
- **Payment Date:** 2026-04-28
- **Payment Method:** easypaisa
- **Status:** failed
- **Failure Reason:** Insufficient balance
- **Retry Attempts:** 2

### Payment 3 - Pending Payment
- **Appointment ID:** AP-003
- **Patient:** Ahmed Hassan
- **Doctor:** Dr. Fatima Ahmed
- **Amount:** 3,500 PKR
- **Payment Status:** pending
- **Created Date:** 2026-04-25
- **Expiry Date:** 2026-04-27 (before appointment)
- **Payment Link Generated:** Yes

### Payment 4 - Refund (Cancellation)
- **Appointment ID:** AP-004
- **Patient:** Zainab Ali
- **Doctor:** Dr. Muhammad Ali
- **Amount:** 3,000 PKR
- **Refund Amount:** 2,500 PKR (after 16.67% admin fee)
- **Refund Status:** completed
- **Refund Date:** 2026-04-20
- **Refund Reference:** REF-2026-04-20-001

---

## 7. TEST RECEIPTS DATA

### Receipt 1 - Standard Receipt
- **Receipt Number:** RCP-2026-001
- **Doctor:** Dr. Muhammad Ali
- **Patient:** Ahmed Hassan
- **Visit Date:** 2026-04-15
- **Treatment:** Consultation + Root Canal
- **Amount Charged:** 3,000 PKR
- **Amount Paid:** 3,000 PKR
- **Medicine Prescribed:** Amoxicillin 500mg
- **Follow-up:** After 2 weeks
- **Receipt Date Generated:** 2026-04-15

### Receipt 2 - Digital Receipt
- **Receipt Number:** RCP-2026-002
- **Doctor:** Dr. Sara Khan
- **Patient:** Ayesha Khan
- **Visit Date:** 2026-04-28
- **Treatment:** Teeth Whitening Consultation
- **Amount Charged:** 4,500 PKR
- **Download Format:** PDF
- **Generated Date:** 2026-04-28

---

## 8. TEST SCENARIOS & WORKFLOWS

### Workflow 1: Patient Registration & First Appointment
1. Register as patient with email: testpatient@test.com
2. Complete profile with medical history
3. Search for doctor by specialization
4. View doctor profile and availability
5. Chat with AI about symptoms
6. Book appointment
7. Complete payment
8. Receive confirmation SMS & Email
9. Attend appointment
10. Provide feedback

### Workflow 2: Doctor Registration & Verification
1. Register as doctor with PMDC license
2. Upload required documents:
   - PMDC License (Front & Back)
   - Clinic Photos (3-5 images)
   - Credentials Certificate
3. Wait for verification (Admin review)
4. Once verified, set availability
5. Update pricing
6. Accept first appointment
7. Send medical report to patient

### Workflow 3: Admin Dashboard Operations
1. Login to admin panel
2. View all doctors (verified & pending)
3. Approve/Reject doctor registrations
4. Monitor appointment metrics
5. Process payment reconciliation
6. Generate revenue reports
7. Handle user complaints

### Workflow 4: AI Chatbot Consultation
1. User describes dental symptoms (text)
2. AI analyzes using NLP
3. AI provides:
   - Initial assessment
   - Home remedies (if applicable)
   - Recommendation for specialist
   - Urgency level (Low/Medium/High)
4. User either books appointment or exits
5. Conversation logged for records

### Workflow 5: Payment & Refund Process
1. Patient books appointment
2. Payment gateway initiated (JazzCash/Easypaisa)
3. Patient completes payment
4. Receipt generated automatically
5. If appointment cancelled within 48 hours:
   - Refund initiated with 16.67% fee deduction
   - Refund processed to original payment method

---

## 9. TEST CHATBOT RESPONSES

### Test Input 1
- **User Input:** "I have severe tooth pain in my upper left molar"
- **Expected AI Response:**
  - Severity: High
  - Possible Causes: Cavity, Infection, Cracked Tooth
  - Immediate Action: Pain management with OTC painkillers
  - Recommendation: Book appointment with Dr. Muhammad Ali (General Dentist)
  - Urgency: Same day or within 48 hours

### Test Input 2
- **User Input:** "My teeth are yellow and I want them white"
- **Expected AI Response:**
  - Severity: Low
  - Category: Cosmetic
  - Possible Treatments: Professional Whitening, Veneers
  - Recommendation: Book with Dr. Fatima Ahmed (Cosmetic Dentist)
  - Estimated Cost: 3,000-8,000 PKR
  - Urgency: Non-urgent, flexible scheduling

### Test Input 3
- **User Input:** "My gums bleed when I brush"
- **Expected AI Response:**
  - Severity: Medium
  - Possible Causes: Gingivitis, Poor Oral Hygiene, Vitamin C Deficiency
  - Home Care: Gentle brushing, Saltwater rinse
  - Recommendation: Book with specialist (Periodontist)
  - Urgency: Within 1-2 weeks

---

## 10. EDGE CASES & ERROR TESTING

### Error Scenario 1: Double Booking
- **Attempt:** Book Dr. Ali for same time slot twice
- **Expected Behavior:** Second booking rejected with message
- **Test Data:** 
  - Doctor: Dr. Muhammad Ali
  - Date: 2026-04-28
  - Time: 2:00 PM
  - Try booking twice with 2 different patients

### Error Scenario 2: Payment Timeout
- **Simulate:** Payment gateway timeout
- **Expected Behavior:** Transaction marked pending, retry option provided
- **Test Duration:** 5 minutes without response

### Error Scenario 3: Invalid PMDC License
- **Doctor Registration:** Upload fake/invalid license
- **Expected Behavior:** Admin rejects with clear reason
- **Test Data:** Use random numbers for PMDC license

### Error Scenario 4: Concurrent Appointment Modifications
- **Test:** Admin and Doctor modify same appointment simultaneously
- **Expected Behavior:** Last action wins, notification sent

### Error Scenario 5: Payment with Insufficient Funds
- **Simulate:** Patient tries to pay with empty account
- **Expected Behavior:** Payment fails, patient alerted
- **Payment Method:** JazzCash/Easypaisa with 0 balance

---

## 11. LOAD TESTING DATA

### Bulk Test - 100 Appointments
- **Pattern:** Create 100 appointments across 4 doctors
- **Distribution:** 
  - Dr. Ali: 35 appointments
  - Dr. Sara: 30 appointments
  - Dr. Fatima: 25 appointments
  - Dr. Hassan: 10 appointments
- **Date Range:** 2026-04-15 to 2026-06-30
- **Status Distribution:**
  - 40% Completed
  - 30% Confirmed
  - 20% Pending
  - 10% Cancelled

### Bulk Test - 50 Payments
- **Pattern:** Process payments for various scenarios
- **Status Distribution:**
  - 80% Successful
  - 15% Failed
  - 5% Pending

---

## 12. SECURITY TESTING DATA

### Test Account - SQL Injection
- **Email:** admin' OR '1'='1
- **Password:** ' OR '1'='1' --
- **Expected:** Login rejected, account not compromised

### Test Account - XSS Attack
- **Name:** <script>alert('XSS')</script>
- **Expected:** Script tags sanitized/escaped

### Test Account - CSRF Token
- **Attempt:** Submit form without valid CSRF token
- **Expected:** Request rejected

---

## 13. PERFORMANCE BENCHMARKS

### Target Metrics
- **Page Load Time:** < 2 seconds
- **API Response Time:** < 500ms
- **Database Query:** < 200ms
- **Image Upload:** < 5MB max
- **PDF Generation:** < 3 seconds

### Test Scenarios
1. Load admin dashboard with 100 appointments
2. Filter appointments by date range
3. Generate 50-page revenue report
4. Export all user data as CSV
5. Generate PDF receipt with images

---

## 14. MOBILE TESTING DATA

### Screen Sizes to Test
- **iPhone SE:** 375x667
- **iPhone 12:** 390x844
- **iPhone 14 Pro Max:** 430x932
- **Samsung S21:** 360x800
- **iPad:** 768x1024
- **Tablet:** 1024x768

### Mobile-Specific Tests
1. Touch interactions on appointments
2. Mobile payment gateway flow
3. Image upload from camera
4. Location services accuracy
5. Offline functionality

---

## 15. DATABASE SEEDING SCRIPT TEMPLATE

```sql
-- Admin Users
INSERT INTO users (email, password_hash, full_name, phone, role, is_active) 
VALUES ('admin@clinismile.com', 'hashed_password', 'Admin User', '+92-300-1234567', 'admin', true);

-- Doctors
INSERT INTO doctors (user_id, pmdc_license, specialization, experience_years, hospital_name, city, is_verified) 
VALUES (2, 'DEN-2015-0001', 'General Dentistry', 8, 'Ali Dental Clinic', 'Karachi', true);

-- Patients
INSERT INTO patients (user_id, age, gender, city, medical_history) 
VALUES (3, 28, 'Male', 'Karachi', 'No allergies');

-- Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, time_slot, status, symptoms) 
VALUES (1, 1, '2026-04-28', '14:00', 'confirmed', 'General checkup');

-- Payments
INSERT INTO payments (appointment_id, amount, payment_method, status, transaction_id) 
VALUES (1, 3000, 'jazzcash', 'completed', 'TXN-123456789');
```

---

## 16. TESTING CHECKLIST

### User Registration & Authentication
- [ ] Patient registration with valid email
- [ ] Patient registration with invalid email
- [ ] Password strength validation
- [ ] Email verification flow
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] Password reset functionality
- [ ] Account lockout after failed attempts

### Doctor Management
- [ ] Doctor registration
- [ ] License upload and validation
- [ ] Doctor profile update
- [ ] Availability slot creation
- [ ] Doctor search by specialization
- [ ] Doctor location on map
- [ ] Doctor reviews and ratings

### Appointment System
- [ ] Book appointment
- [ ] Cancel appointment with refund
- [ ] Reschedule appointment
- [ ] View appointment history
- [ ] Receive appointment reminders
- [ ] Upload medical reports
- [ ] Provide appointment feedback

### Payment System
- [ ] Complete payment
- [ ] Failed payment handling
- [ ] Refund processing
- [ ] Receipt generation
- [ ] Invoice download
- [ ] Transaction history

### Admin Dashboard
- [ ] View all users
- [ ] Verify doctor registrations
- [ ] View appointment metrics
- [ ] Revenue reports
- [ ] User management
- [ ] System settings

### AI Chatbot
- [ ] Symptom analysis
- [ ] Doctor recommendations
- [ ] Home remedy suggestions
- [ ] Urgency level assessment
- [ ] Conversation history

---

## 17. IMPORTANT NOTES FOR TESTING

### Before Starting
1. Ensure database is reset/fresh
2. Clear browser cache and cookies
3. Use incognito/private browsing mode
4. Test on multiple browsers (Chrome, Firefox, Safari, Edge)
5. Test on mobile and desktop
6. Document all bugs with screenshots
7. Record response times

### Test Execution Order
1. Authentication flows first
2. Core functionality (appointments, payments)
3. Admin operations
4. Edge cases and error scenarios
5. Performance and load tests
6. Mobile responsiveness
7. Security testing

### Data Cleanup After Testing
1. Delete test accounts
2. Remove test appointments
3. Clear test payments
4. Reset doctor availability
5. Archive test receipts

---

**Document Version:** 1.0
**Last Updated:** April 27, 2026
**Application:** CliniSmile - AI Dental Platform
**Test Environment:** Development & Staging
