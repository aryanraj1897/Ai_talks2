import json
import logging
from typing import Dict, Any, Optional
import redis
from config import settings

logger = logging.getLogger(__name__)

class RedisMemory:
    """Session Memory Manager with Redis & In-Memory Storage Fallback."""
    
    def __init__(self):
        self._in_memory_store: Dict[str, str] = {}
        self.redis_client = None
        try:
            r = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=0,
                socket_timeout=1.0,
                decode_responses=True
            )
            r.ping()
            self.redis_client = r
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Redis unavailable ({e}). Using thread-safe in-memory session store fallback.")

    def set_session(self, session_id: str, state_dict: Dict[str, Any], ttl_seconds: int = 86400) -> bool:
        """Saves interview state session to Redis or memory."""
        serialized = json.dumps(state_dict)
        if self.redis_client:
            try:
                self.redis_client.setex(f"session:{session_id}", ttl_seconds, serialized)
                return True
            except Exception as e:
                logger.error(f"Redis write error: {e}")
        self._in_memory_store[session_id] = serialized
        return True

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves interview state session from Redis or memory."""
        if self.redis_client:
            try:
                data = self.redis_client.get(f"session:{session_id}")
                if data:
                    return json.loads(data)
            except Exception as e:
                logger.error(f"Redis read error: {e}")
                
        if session_id in self._in_memory_store:
            return json.loads(self._in_memory_store[session_id])
        return None

    def is_redis_available(self) -> bool:
        return self.redis_client is not None
