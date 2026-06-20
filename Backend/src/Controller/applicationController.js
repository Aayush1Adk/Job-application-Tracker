const pool = require("../db/db");

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const result = await pool.query(
            "SELECT * FROM applications WHERE id = $1", [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json(result.rows[0]);
    } 
    catch (error) {
        console.error("getApplicationById error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const buildApplicationFilters = (query) => {
    const { status, job_type, applied_date, search } = query;

    const conditions = [];
    const values = [];

    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    if (job_type) {
        values.push(job_type);
        conditions.push(`job_type = $${values.length}`);
    }

    if (applied_date) {
        values.push(applied_date);
        conditions.push(`applied_date = $${values.length}`);
    }

    if (search) {
        values.push(`%${search}%`);
        const idx = values.length;
        conditions.push(
            `(company_name ILIKE $${idx} OR job_title ILIKE $${idx} OR job_type ILIKE $${idx} OR COALESCE(notes,'') ILIKE $${idx})`
        );
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

    return { whereClause, values };
};

const getApplication = async (req, res) => {
    try {
        const { sortBy, order, page, limit } = req.query;

        const { whereClause, values } = buildApplicationFilters(req.query);

        const validSortFields = ['id', 'company_name', 'job_title', 'job_type', 'status', 'applied_date', 'created_at', 'updated_at'];
        const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        const listValues = [...values, limitNum, offset];
        const listQuery =
            `SELECT * FROM applications${whereClause} ` +
            `ORDER BY ${sortField} ${sortOrder} ` +
            `LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

        const countQuery = `SELECT COUNT(*) as total FROM applications${whereClause}`;

        const [result, countResult] = await Promise.all([
            pool.query(listQuery, listValues),
            pool.query(countQuery, values),
        ]);

        const total = parseInt(countResult.rows[0].total);

        res.status(200).json({
            data: result.rows,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }   
    
    catch (error) {
        console.error("getApplication error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

const createApplication = async (req, res) => {
    try {
        const application = await pool.query(
            `INSERT INTO applications (company_name, job_title, job_type, status, applied_date, notes) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, 
            [
                req.body.company_name?.trim(),
                req.body.job_title?.trim(),
                req.body.job_type?.trim(),
                req.body.status?.trim(),
                req.body.applied_date,
                req.body.notes?.trim() || null
            ]
        );
        
        if (!application.rows || application.rows.length === 0) {
            return res.status(500).json({ message: "Failed to create application" });
        }
        
        res.status(201).json(application.rows[0]);
    }
    catch (error) {
        console.error("createApplication error:", error.message);
        if (error.code === '23514') {
            return res.status(400).json({ message: "Invalid data: check constraints failed" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};



    const updateApplication = async (req, res) => {
        try {
            const { id } = req.params;


            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: "Invalid application ID" });
            }

            const existing = await pool.query(
                "SELECT * FROM applications WHERE id = $1", [id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({ message: "Application not found" });
            }

            const application = existing.rows[0];

            const company_name = req.body.company_name?.trim() ?? application.company_name;
            const job_title = req.body.job_title?.trim() ?? application.job_title;
            const job_type = req.body.job_type?.trim() ?? application.job_type;
            const status = req.body.status?.trim() ?? application.status;
            const applied_date = req.body.applied_date ?? application.applied_date;
            const notes = req.body.notes?.trim() ?? application.notes;

            const result = await pool.query(
                `UPDATE applications
                    SET company_name = $1, job_title = $2, job_type = $3, status = $4, 
                        applied_date = $5, notes = $6, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = $7 RETURNING *`, 
                [company_name, job_title, job_type, status, applied_date, notes, id]
            );

            if (!result.rows || result.rows.length === 0) {
                return res.status(500).json({ message: "Failed to update application" });
            }

            res.status(200).json({
                message: "Application updated successfully", 
                application: result.rows[0] 
            });
        } 
        catch (error) {
            console.error("updateApplication error:", error.message);
            if (error.code === '23514') {
                return res.status(400).json({ message: "Invalid data: check constraints failed" });
            }
            res.status(500).json({ message: "Server Error" });
        }
    };


const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;


        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const result = await pool.query(
            `DELETE FROM applications WHERE id = $1 RETURNING *`, 
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({ 
            message: "Application deleted successfully", 
            application: result.rows[0] 
        });

    } 
    catch (error) {
        console.error("deleteApplication error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};




module.exports = { getApplicationById, getApplication, createApplication, updateApplication, deleteApplication };