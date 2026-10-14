import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRandomCode } from '../src/controllers/referralCodeController.js';

test('generateRandomCode produces RAC- prefix followed by 5 uppercase alphanumerics', () => {
    const code = generateRandomCode();
    assert.match(code, /^RAC-[A-Z0-9]{5}$/);
    
    // Check uniqueness across 20 calls
    const set = new Set();
    for (let i = 0; i < 20; i++) {
        set.add(generateRandomCode());
    }
    assert.equal(set.size, 20);
});
