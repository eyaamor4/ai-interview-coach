import { useState } from "react";

function InterviewForm({ onStart }) {
    const [jobTitle, setJobTitle] = useState("");
    const [level, setLevel] = useState("Junior");
    const [numberOfQuestions, setNumberOfQuestions] = useState(5);

    const handleSubmit = (e) => {
        e.preventDefault();

        onStart({
            job_title: jobTitle,
            level: level,
            number_of_questions: numberOfQuestions,
        });
    };

    return (
        <form className="interview-form" onSubmit={handleSubmit}>
            <h2>Start a New Interview</h2>

            <div className="form-group">
                <label>Job Title</label>

                <input
                    type="text"
                    placeholder="AI Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Level</label>

                <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                >
                    <option>Junior</option>
                    <option>Intermediate</option>
                    <option>Senior</option>
                </select>
            </div>

            <div className="form-group">
                <label>Number of Questions</label>

                <select
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                </select>
            </div>

            <button type="submit">
                Start Interview
            </button>
        </form>
    );
}

export default InterviewForm;