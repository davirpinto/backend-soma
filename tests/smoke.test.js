const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://127.0.0.1:3000';
const timestamp = Date.now();
const testUser = {
    name: `Test User`,
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123'
};

let authToken = '';
let assessmentId = '';

describe('API Smoke Tests', async () => {

    test('POST /api/auth/register - Should register a new user', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const data = await res.json();
        assert.strictEqual(res.status, 201, 'Response status should be 201');
        assert.ok(data.token, 'Should return a token');
        assert.strictEqual(data.user.email, testUser.email);

        authToken = data.token;
    });

    test('POST /api/auth/login - Should login the user', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });

        const data = await res.json();
        assert.strictEqual(res.status, 200, 'Response status should be 200');
        assert.ok(data.token, 'Should return a token');
    });

    test('POST /api/assessments - Should create an assessment', async () => {
        const res = await fetch(`${BASE_URL}/api/assessments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                contactInfo: {
                    name: "Test Contact",
                    email: "contact@example.com",
                    role: "Manager",
                    companyName: "Test Corp",
                    employees: 50,
                    industry: "Tech",
                    clientType: "b2b",
                    maturityLevel: "1"
                }
            })
        });

        const data = await res.json();
        if (res.status !== 201) console.error('Create Assessment Error:', data);

        assert.strictEqual(res.status, 201, 'Response status should be 201');
        assert.ok(data.id, 'Should return assessment ID');
        assert.strictEqual(data.status, 'in_progress');

        assessmentId = data.id;
    });

    test('GET /api/assessments/:id - Should retrieve the assessment', async () => {
        const res = await fetch(`${BASE_URL}/api/assessments/${assessmentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await res.json();
        assert.strictEqual(res.status, 200, 'Response status should be 200');
        assert.strictEqual(data.id, assessmentId);
    });
});
