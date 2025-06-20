# Backend Architecture

This document describes the refactored backend architecture for the picture management system.

## Directory Structure

```
components/
├── __init__.py          # Main package exports
├── api/                 # FastAPI route handlers
│   ├── __init__.py
│   ├── upload_routes.py    # Upload endpoints
│   ├── folder_routes.py    # Folder management endpoints  
│   └── picture_routes.py   # Picture management endpoints
├── services/            # Business logic layer
│   ├── __init__.py
│   ├── upload_service.py   # File upload operations
│   ├── folder_service.py   # Folder operations
│   └── picture_service.py  # Picture operations
├── models/              # Data models and schemas
│   ├── __init__.py
│   ├── picture.py          # Picture data models
│   ├── folder.py           # Folder data models
│   └── upload.py           # Upload response models
└── utils/               # Shared utilities
    ├── __init__.py
    ├── constants.py        # Application constants
    └── file_utils.py       # File system utilities
```

## Architecture Principles

### 1. Separation of Concerns
- **API Layer**: Handles HTTP requests/responses and validation
- **Service Layer**: Contains business logic and orchestrates operations
- **Models Layer**: Defines data structures and validation schemas
- **Utils Layer**: Provides shared utilities and helpers

### 2. Dependency Flow
```
API Routes → Services → Utils
     ↓
   Models
```

### 3. Key Benefits
- **Maintainability**: Clear separation makes code easier to understand and modify
- **Testability**: Each layer can be tested independently
- **Reusability**: Services can be reused across different API endpoints
- **Scalability**: Easy to add new features following the established patterns

## API Endpoints

### Upload Operations
- `POST /pictures` - Upload multiple pictures to a folder

### Folder Operations  
- `GET /folders` - List all folders and contents
- `GET /folders/{folder_name}` - Get specific folder contents
- `GET /folders/{folder_name}/info` - Get folder information
- `PUT /folders/{folder_name}/rename` - Rename a folder
- `POST /folders/{folder_name}/duplicate` - Duplicate a folder
- `DELETE /folders/{folder_name}` - Delete a folder

### Picture Operations
- `GET /pictures/{folder_name}/{filename}` - Download a picture
- `GET /pictures/{folder_name}/{filename}/info` - Get picture information
- `PUT /pictures/{folder_name}/{filename}` - Update a picture
- `DELETE /pictures/{folder_name}/{filename}` - Delete a picture

## Usage Examples

### Adding New Endpoints

1. **Define models** in `components/models/`
2. **Implement business logic** in `components/services/`
3. **Create API routes** in `components/api/`
4. **Update exports** in respective `__init__.py` files

### Example: Adding a new feature

```python
# 1. Add model in components/models/example.py
class ExampleModel(BaseModel):
    name: str
    value: int

# 2. Add service in components/services/example_service.py  
class ExampleService:
    @staticmethod
    def process_example(data: ExampleModel):
        # Business logic here
        pass

# 3. Add routes in components/api/example_routes.py
router = APIRouter(prefix="", tags=["example"])

@router.post("/example")
def create_example(data: ExampleModel):
    return ExampleService.process_example(data)
```

## Migration from Old Structure

The previous structure had everything in `components/manage/` which mixed concerns:
- Route handlers, business logic, and utilities were all together
- Made testing and maintenance difficult
- Limited reusability of components

The new structure provides:
- Clear separation of concerns
- Better testability
- Improved maintainability
- Easier to extend and modify
