const app = require("./src/app.js");
const pool = require("./src/db/db.js");

const PORT = process.env.PORT || 5000;

pool.query("SELECT NOW()")
  .then(() => {
    console.log("Database Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });

  
/*
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,

    company_name VARCHAR(255) NOT NULL,

    job_title VARCHAR(255) NOT NULL,

    job_type VARCHAR(50) NOT NULL
    CHECK (
        job_type IN (
            'Internship',
            'Full-time',
            'Part-time'
        )
    ),

    status VARCHAR(50) NOT NULL
    CHECK (
        status IN (
            'Applied',
            'Interviewing',
            'Offer',
            'Rejected'
        )
    ),

    applied_date DATE NOT NULL,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); */