
const isAppliedDateInFuture = (applied_date) => {
    const appliedDate = new Date(applied_date);

    const todayWithBuffer = new Date();
    todayWithBuffer.setUTCHours(0, 0, 0, 0);
    todayWithBuffer.setUTCDate(todayWithBuffer.getUTCDate() + 1);

    return appliedDate > todayWithBuffer;
};

const validateApplication = (req, res, next) => {
    let { company_name, job_title, job_type, status, applied_date } = req.body;

    
    company_name = company_name?.trim();
    job_title = job_title?.trim();
    job_type = job_type?.trim();
    status = status?.trim();

    if (!company_name || !job_title || !job_type || !status || !applied_date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (company_name.length < 2) {
        return res.status(400).json({ message: "company name must be at least 3 characters" });
    }

    if (job_title.length < 2) {
        return res.status(400).json({ message: "job title must be at least 3 characters" });
    }

    if (company_name.length > 150 ) {
        return res.status(400).json({ message: "company name must be less than 150 characters" });
    }

    if (job_title.length > 150 ) {
        return res.status(400).json({ message: "job title must be less than 150 characters" });
    }

    const validJobTypes = ['Internship', 'Full-time', 'Part-time'];

    if (!validJobTypes.includes(job_type)) {
        return res.status(400).json({ message: "Invalid job type" });
    }

    const validStatuses = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    if (isNaN(Date.parse(applied_date))) {
        return res.status(400).json({ message: "Invalid applied date" });
    }

    if (isAppliedDateInFuture(applied_date)) {
        return res.status(400).json({ message: "Applied date cannot be in the future" });
    }

    next();
};


const validateUpdateApplication = (req, res, next) => {

    const { company_name, job_title, job_type, status, applied_date } = req.body;

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    if (company_name !== undefined) {
        const trimmedName = company_name.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({ message: "Company name must be at least 3 characters" });
        }
        if (trimmedName.length > 150) {
            return res.status(400).json({ message: "Company name must be less than 150 characters" });
        }
    }

    if (job_title !== undefined) {
        const trimmedTitle = job_title.trim();
        if (trimmedTitle.length < 2) {
            return res.status(400).json({ message: "Job title must be at least 3 characters" });
        }
        if (trimmedTitle.length > 150) {
            return res.status(400).json({ message: "Job title must be less than 150 characters" });
        }
    }

    const validJobTypes = ["Internship", "Full-time", "Part-time"];

    if (job_type !== undefined && !validJobTypes.includes(job_type)) {
        return res.status(400).json({ message: "Invalid job type" });
    }

    const validStatuses = ["Applied", "Interviewing", "Offer", "Rejected"];

    if (status !== undefined && !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    if (applied_date !== undefined) {
        if (isNaN(Date.parse(applied_date))) {
            return res.status(400).json({ message: "Invalid applied date" });
        }
        if (isAppliedDateInFuture(applied_date)) {
            return res.status(400).json({ message: "Applied date cannot be in the future" });
        }
    }

    next();
};


module.exports = { validateApplication, validateUpdateApplication };