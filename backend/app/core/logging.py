"""
Structured logging utility for the application
"""
import logging
import sys
from typing import Optional, Dict, Any
from datetime import datetime


class StructuredLogger:
    """
    Structured logger that provides consistent logging format
    with module, function, and context information
    """
    
    def __init__(self, name: str):
        """
        Initialize structured logger
        
        Args:
            name: Logger name (typically __name__)
        """
        self.logger = logging.getLogger(name)
        self._setup_handler()
    
    def _setup_handler(self):
        """Setup logging handler if not already configured"""
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            formatter = logging.Formatter(
                '%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s | %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def info(
        self, 
        message: str, 
        extra: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Log info message with optional context
        
        Args:
            message: Log message
            extra: Additional context dictionary
            **kwargs: Additional context as keyword arguments
        """
        context = {**(extra or {}), **kwargs}
        if context:
            message = f"{message} | Context: {context}"
        self.logger.info(message)
    
    def error(
        self, 
        message: str, 
        extra: Optional[Dict[str, Any]] = None,
        exc_info: bool = False,
        **kwargs
    ):
        """
        Log error message with optional context and exception info
        
        Args:
            message: Log message
            extra: Additional context dictionary
            exc_info: Whether to include exception traceback
            **kwargs: Additional context as keyword arguments
        """
        context = {**(extra or {}), **kwargs}
        if context:
            message = f"{message} | Context: {context}"
        self.logger.error(message, exc_info=exc_info)
    
    def warning(
        self, 
        message: str, 
        extra: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Log warning message with optional context
        
        Args:
            message: Log message
            extra: Additional context dictionary
            **kwargs: Additional context as keyword arguments
        """
        context = {**(extra or {}), **kwargs}
        if context:
            message = f"{message} | Context: {context}"
        self.logger.warning(message)
    
    def debug(
        self, 
        message: str, 
        extra: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Log debug message with optional context
        
        Args:
            message: Log message
            extra: Additional context dictionary
            **kwargs: Additional context as keyword arguments
        """
        context = {**(extra or {}), **kwargs}
        if context:
            message = f"{message} | Context: {context}"
        self.logger.debug(message)


def get_logger(name: str) -> StructuredLogger:
    """
    Get a structured logger instance
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        StructuredLogger instance
    """
    return StructuredLogger(name)


