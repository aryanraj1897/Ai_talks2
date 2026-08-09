from fastapi import APIRouter, HTTPException
from parsers.spec_parser import SpecParser, APISpecification

router = APIRouter()

@router.get("/specs", response_model=APISpecification)
def get_parsed_specs():
    """Returns dynamically parsed API endpoints, methods, headers, schemas & business rules 
    extracted directly from technical-specs.md without hardcoding.
    """
    try:
        return SpecParser.parse_specs()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
