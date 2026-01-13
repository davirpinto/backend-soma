const BASE_URL = 'http://127.0.0.1:3000';
const timestamp = Date.now();
const testUser = {
    name: `Test User`,
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123'
};

async function runTest() {
    try {
        console.log('Testing with user:', testUser.email);

        // 1. Register
        const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        if (regRes.status !== 201) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
        const token = regData.token;
        console.log('✅ Registered successfully');

        // 2. Create Assessment
        const createRes = await fetch(`${BASE_URL}/api/assessments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
        const createData = await createRes.json();
        if (createRes.status !== 201) throw new Error(`Create assessment failed: ${JSON.stringify(createData)}`);
        const assessmentId = createData.id;
        console.log('✅ Assessment created:', assessmentId);

        // 3. Update Economic Profile with "BROKEN" data (strings)
        console.log('Sending economic profile with string values...');
        const updateRes = await fetch(`${BASE_URL}/api/assessments/${assessmentId}/economic-profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                economicProfile: {
                    responses: {
                        "1": "100000",
                        "2": "50000",
                        "3": "Sim",
                        "4": "Não aplica",
                        "5": 123,
                        "6": "{\"notApplicable\": true}",
                        "7": "Just a string",
                        "8": "Final answer"
                    }
                }
            })
        });

        const updateData = await updateRes.json();
        if (updateRes.status !== 200) {
            console.error('❌ Update failed with status:', updateRes.status);
            console.error('Details:', JSON.stringify(updateData, null, 2));
            process.exit(1);
        }
        console.log('✅ Update successful (Status 200)');

        // 4. Verify normalization
        const getRes = await fetch(`${BASE_URL}/api/assessments/${assessmentId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const assessment = await getRes.json();

        console.log('Verifying normalization in database...');
        const responses = assessment.economicProfile.responses;

        let allGood = true;
        for (let i = 1; i <= 8; i++) {
            const resp = responses[String(i)];
            if (typeof resp !== 'object' || resp === null || !('notApplicable' in resp)) {
                console.error(`❌ Question ${i} not correctly normalized:`, resp);
                allGood = false;
            } else {
                console.log(`✅ Question ${i} normalized:`, JSON.stringify(resp));
            }
        }

        if (allGood) {
            console.log('\n✨ ALL TESTS PASSED! The backend is now flexible and normalizing correctly.');
        } else {
            console.log('\n⚠️ Some issues found in normalization.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test script error:', error.message);
        process.exit(1);
    }
}

runTest();
