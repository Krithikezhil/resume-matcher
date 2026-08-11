import { useState } from 'react';
import './App.css';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please fill in both fields before analyzing.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Something went wrong. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) return '#2ecc71';
    if (score >= 50) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="page">
      <div className="app-container">
        <div className="header">
          <h1>AI Resume Matcher</h1>
          <p>Paste a resume and job description to see how well they align</p>
        </div>

        <div className="card">
          <div className="field-group">
            <label>Resume Text</label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
            />
          </div>

          <div className="field-group">
            <label>Job Description</label>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
            />
          </div>

          <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>

          {error && <p className="error-text">{error}</p>}
        </div>

        {result && (
          <div className="results">
            <div className="score-row">
              <div className="score-number">{result.matchScore}%</div>
              <div className="score-bar-bg">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${result.matchScore}%`,
                    background: scoreColor(result.matchScore),
                  }}
                />
              </div>
            </div>

            <div className="skills-section">
              <div className="skills-label">Matched Skills</div>
              <div className="tag-row">
                {result.matchedSkills.length === 0 && <span className="empty-note">None</span>}
                {result.matchedSkills.map((skill, i) => (
                  <span className="tag matched" key={i}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="skills-section">
              <div className="skills-label">Missing Skills</div>
              <div className="tag-row">
                {result.missingSkills.length === 0 && <span className="empty-note">None</span>}
                {result.missingSkills.map((skill, i) => (
                  <span className="tag missing" key={i}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="questions-section">
              <h3>Likely Interview Questions</h3>
              <ul>
                {result.interviewQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <p className="footer-note">Built by Krithik · Spring Boot + React + Gemini API</p>
      </div>
    </div>
  );
}

export default App;