from enum import Enum

from pydantic import BaseModel


class AssignmentAction(str, Enum):
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"


class AssignmentActionRequest(BaseModel):
    action: AssignmentAction