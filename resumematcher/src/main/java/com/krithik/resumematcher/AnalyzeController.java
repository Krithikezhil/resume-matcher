package com.krithik.resumematcher;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalyzeController {

    private final GeminiService geminiService;
    private final ObjectMapper mapper;

    public AnalyzeController(
            GeminiService geminiService,
            ObjectMapper mapper) {

        this.geminiService = geminiService;
        this.mapper = mapper;
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyze(
            @RequestBody AnalyzeRequest request) throws Exception {

        String prompt = """
                You are a resume analysis assistant.

                Compare the resume to the job description.

                Return ONLY valid JSON.
                Do not use markdown.
                Do not use ```json.
                Do not include any explanation.

                Return exactly this structure:

                {
                  "matchScore": 0,
                  "matchedSkills": [],
                  "missingSkills": [],
                  "interviewQuestions": []
                }

                Rules:
                - matchScore must be a number between 0 and 100.
                - matchedSkills must be an array of strings.
                - missingSkills must be an array of strings.
                - interviewQuestions must contain 3 to 5 questions.

                Resume:
                %s

                Job Description:
                %s
                """.formatted(
                request.getResumeText(),
                request.getJobDescription()
        );

        String rawResponse = geminiService.callGemini(prompt);

        String cleanedResponse = rawResponse.trim();

        if (cleanedResponse.startsWith("```json")) {
            cleanedResponse = cleanedResponse.substring(7).trim();
        } else if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.substring(3).trim();
        }

        if (cleanedResponse.endsWith("```")) {
            cleanedResponse = cleanedResponse
                    .substring(0, cleanedResponse.length() - 3)
                    .trim();
        }

        return mapper.readValue(
                cleanedResponse,
                new TypeReference<Map<String, Object>>() {}
        );
    }
}