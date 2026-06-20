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

const getApplication = async (req, res) => {
    try {

        const { status, job_type, applied_date, search, sortBy, order, page, limit } = req.query;

        let query = "SELECT * FROM applications";
        let conditions = [];
        let values = [];

        if (status) {
            conditions.push(`status = $${values.length + 1}`);
            values.push(status);
        }

        if (job_type) {
            conditions.push(`job_type = $${values.length + 1}`);
            values.push(job_type);
        }

        if (applied_date) {
            conditions.push(`applied_date = $${values.length + 1}`);
            values.push(applied_date);
        }

if (search) {
    conditions.push(
        `(company_name ILIKE $${values.length + 1}
        OR job_title ILIKE $${values.length + 1}
        OR job_type ILIKE $${values.length + 1}
        OR COALESCE(notes,'') ILIKE $${values.length + 1})`
    );

    values.push(`%${search}%`);
}

        if (conditions.length > 0) 
            {
            query += " WHERE " + conditions.join(" AND ");
            }


        const validSortFields = ['id', 'company_name', 'job_title', 'job_type', 'status', 'applied_date', 'created_at', 'updated_at'];
        const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;


        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limitNum);
        values.push(offset);

        const result = await pool.query(query, values);

        let countQuery = "SELECT COUNT(*) as total FROM applications";
        let countValues = [];
        
        if (conditions.length > 0) {
            
            let countConditions = [];
            let tempValues = [];
            
            if (status) {
                countConditions.push(`status = $${tempValues.length + 1}`);
                tempValues.push(status);
            }
            if (job_type) {
                countConditions.push(`job_type = $${tempValues.length + 1}`);
                tempValues.push(job_type);
            }
            if (applied_date) {
                countConditions.push(`applied_date = $${tempValues.length + 1}`);
                tempValues.push(applied_date);
            }
if (search) {
    countConditions.push(
        `(company_name ILIKE $${tempValues.length + 1}
        OR job_title ILIKE $${tempValues.length + 1}
        OR job_type ILIKE $${tempValues.length + 1}
        OR notes ILIKE $${tempValues.length + 1})`
    );

    tempValues.push(`%${search}%`);
}
            
            countQuery += " WHERE " + countConditions.join(" AND ");
            countValues = tempValues;
        }

        const countResult = await pool.query(countQuery, countValues);
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
    }

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