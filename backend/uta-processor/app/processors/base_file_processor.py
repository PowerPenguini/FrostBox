from abc import ABC, abstractmethod
import pandas as pd

class BaseFileProcessor(ABC):
    """Abstract base class for all file processors"""
    
    @abstractmethod
    def validate(self, contents: bytes) -> None:
        """Validate file contents"""
        pass
    
    @abstractmethod
    def process(self, contents: bytes) -> pd.DataFrame:
        """Process file contents into DataFrame"""
        pass
    
    @abstractmethod
    def save_to_database(self, session, df: pd.DataFrame) -> int:
        """Save processed data to database"""
        pass
