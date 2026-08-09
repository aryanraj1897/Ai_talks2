import pytest
from parsers.curriculum_parser import CurriculumParser
from parsers.candidate_parser import CandidateParser
from parsers.spec_parser import SpecParser

def test_curriculum_parser():
    curriculum = CurriculumParser.parse_curriculum()
    assert isinstance(curriculum, list)
    assert len(curriculum) == 31
    day_1 = curriculum[0]
    assert day_1.day == 1
    assert day_1.module is not None
    assert day_1.title is not None

def test_curriculum_documents_extraction():
    curriculum = CurriculumParser.parse_curriculum()
    texts, metadatas, ids = CurriculumParser.extract_documents_and_metadata(curriculum)
    assert len(texts) == 31
    assert len(metadatas) == 31
    assert len(ids) == 31
    assert ids[0] == "day_1"

def test_candidate_parser():
    candidates = CandidateParser.parse_candidates()
    assert isinstance(candidates, list)
    assert len(candidates) > 0
    cand = candidates[0]
    assert cand.id is not None
    assert cand.name is not None

def test_spec_parser():
    specs = SpecParser.parse_specs()
    assert specs is not None
    assert len(specs.endpoints) > 0
    assert any(e.path == "/api/v1/health" for e in specs.endpoints)
