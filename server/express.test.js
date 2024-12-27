const http = require('http');

test('Test 2 - listening on port 8000', (done) => {
    http.get('http://localhost:8000', (res) => {
        expect(res.statusCode).toBe(200);
        done();
    }).on('error', (err) => {
        done.fail(`Server is not running: ${err.message}`);
    });
});
