const { validateApplication, validateUpdateApplication } = require("./applicationvalidator");

// Minimal fakes for Express's req/res/next so we can test the middleware
// in isolation, without spinning up a server or touching the database.
function mockReqRes(body = {}) {
    const req = { body };
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    const next = jest.fn();
    return { req, res, next };
}

describe("validateApplication", () => {
    const validBody = {
        company_name: "Acme Corp",
        job_title: "Frontend Developer",
        job_type: "Full-time",
        status: "Applied",
        applied_date: new Date().toLocaleDateString("en-CA"), // today, local
    };

    test("calls next() when all fields are valid", () => {
        const { req, res, next } = mockReqRes({ ...validBody });
        validateApplication(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
    });

    test("rejects when a required field is missing", () => {
        const { req, res, next } = mockReqRes({ ...validBody, company_name: "" });
        validateApplication(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
    });

    test("accepts a 2-character company name (spec minimum)", () => {
        const { req, res, next } = mockReqRes({ ...validBody, company_name: "AB" });
        validateApplication(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects a 1-character company name", () => {
        const { req, res, next } = mockReqRes({ ...validBody, company_name: "A" });
        validateApplication(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/at least 2/i);
    });

    test("rejects an invalid job_type", () => {
        const { req, res, next } = mockReqRes({ ...validBody, job_type: "Contractor" });
        validateApplication(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/job type/i);
    });

    test("rejects an invalid status", () => {
        const { req, res, next } = mockReqRes({ ...validBody, status: "Ghosted" });
        validateApplication(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/status/i);
    });

    test("rejects an applied_date several days in the future", () => {
        const future = new Date();
        future.setDate(future.getDate() + 5);
        const { req, res, next } = mockReqRes({
            ...validBody,
            applied_date: future.toLocaleDateString("en-CA"),
        });
        validateApplication(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/future/i);
    });
});

describe("validateUpdateApplication", () => {
    test("rejects an empty body (nothing to update)", () => {
        const { req, res, next } = mockReqRes({});
        validateUpdateApplication(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
    });

    test("allows a partial update with just one field", () => {
        const { req, res, next } = mockReqRes({ status: "Interviewing" });
        validateUpdateApplication(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects an invalid status on partial update", () => {
        const { req, res, next } = mockReqRes({ status: "Ghosted" });
        validateUpdateApplication(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
    });
});
