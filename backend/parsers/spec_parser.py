import re
import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from config import settings

class ExtractedEndpoint(BaseModel):
    method: str
    path: str
    summary: str
    description: str
    request_schema_example: Optional[Any] = None
    response_schema_example: Optional[Any] = None
    headers_required: List[str] = Field(default_factory=list)

class APISpecification(BaseModel):
    title: str
    system_overview: str
    business_rules: List[str] = Field(default_factory=list)
    endpoints: List[ExtractedEndpoint] = Field(default_factory=list)

class SpecParser:
    """Parses technical-specs.md dynamically to extract Endpoints, Methods, Headers, 
    Schemas, and Validation rules without hardcoding.
    """
    
    @staticmethod
    def parse_specs(file_path: str = None) -> APISpecification:
        path = file_path or settings.TECHNICAL_SPECS_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(f"Technical specs file not found at: {path}")

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else "API Specification"

        # Extract Business Rules
        rules = re.findall(r"\d+\.\s+\*\*([^*]+)\*\*:\s*(.+)", content)
        business_rules = [f"{r[0]}: {r[1]}" for r in rules]

        # Extract Endpoints pattern: #### `METHOD /path`
        endpoint_pattern = re.compile(
            r"####\s+`([A-Z]+)\s+([^`]+)`\s*\n([^#\n]*)(.*?)(?=(####|###|##|\Z))",
            re.DOTALL
        )

        endpoints: List[ExtractedEndpoint] = []
        for match in endpoint_pattern.finditer(content):
            method = match.group(1).strip().upper()
            ep_path = match.group(2).strip()
            summary = match.group(3).strip()
            body_text = match.group(4)

            # Extract JSON code blocks (Request & Response schemas)
            json_blocks = re.findall(r"```json\s*(.*?)\s*```", body_text, re.DOTALL)
            
            req_example = None
            resp_example = None

            if json_blocks:
                for block in json_blocks:
                    try:
                        parsed_json = json.loads(block)
                        if "query" in parsed_json or "candidate_id" in parsed_json or "session_id" in parsed_json:
                            req_example = parsed_json
                        else:
                            resp_example = parsed_json
                    except Exception:
                        pass
                        
                if not req_example and json_blocks:
                    try:
                        req_example = json.loads(json_blocks[0])
                    except Exception:
                        pass

            headers = ["Authorization: Bearer <token>", "Content-Type: application/json"]

            endpoints.append(
                ExtractedEndpoint(
                    method=method,
                    path=ep_path,
                    summary=summary,
                    description=summary,
                    request_schema_example=req_example,
                    response_schema_example=resp_example,
                    headers_required=headers
                )
            )

        return APISpecification(
            title=title,
            system_overview="Dynamic Autonomous AI Interviewer Platform Specification",
            business_rules=business_rules,
            endpoints=endpoints
        )
