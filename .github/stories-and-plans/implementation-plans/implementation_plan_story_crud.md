# Story CRUD Feature Implementation Plan

## 🎯 Big Picture Summary

**Goal**: Add MongoDB persistence for stories with backend REST APIs and frontend UI to create and display stories.

**Approach**: Extend backend with Spring Data MongoDB, create Story entity/repository/service/controller, add React frontend form and list components to interact with the APIs.

**Impacted Files**:
• `backend/pom.xml` - Add Spring Data MongoDB dependency
• `backend/src/main/java/com/momandme/model/Story.java` - Story entity
• `backend/src/main/java/com/momandme/repository/StoryRepository.java` - MongoDB repository
• `backend/src/main/java/com/momandme/service/StoryService.java` - Business logic
• `backend/src/main/java/com/momandme/controller/StoryController.java` - REST endpoints
• `backend/src/main/resources/application.properties` - MongoDB connection config
• `frontend/src/types/Story.ts` - TypeScript Story type
• `frontend/src/services/storyService.ts` - API client
• `frontend/src/components/StoryList.tsx` - Display stories
• `frontend/src/components/StoryForm.tsx` - Add new story
• `frontend/src/App.tsx` - Integrate story components

**Key Constraints**:
• Methods: ≤10 lines (5 preferred)
• Files: ≤200 lines
• Parameters: ≤3 per method
• Constructor injection only
• DTOs for API boundaries
• REST API best practices

**Dependencies/Notes**: Requires MongoDB running locally (or Docker container). Story model includes: title, content, ageGroup (min/max), durationMinutes, tags, moral, language, source (type/referenceId), status, createdBy, createdAt, updatedAt.

---

## Overview

This feature enables users to create and view stories stored in MongoDB. It provides:
- Backend REST APIs for creating and retrieving stories with rich metadata
- MongoDB persistence layer using Spring Data with embedded ageGroup and source objects
- React frontend with form for creating stories (including age range, tags, moral, duration) and list for displaying them
- Type-safe communication between frontend and backend
- Support for different story sources (static, AI-generated, user-submitted) and statuses

## Scope & Assumptions

**In Scope:**
- Create story (POST /api/stories) with full metadata (title, content, ageGroup, tags, moral, language, duration, source, status)
- Fetch all stories (GET /api/stories)
- MongoDB setup and configuration
- Frontend UI for story creation with all fields and display with filtering by age/tags
- Validation (required fields: title, content, ageGroup, language; defaults for optional fields)
- Embedded objects for ageGroup (min/max) and source (type/referenceId)

**Out of Scope:**
- Update/delete story operations
- Pagination and sorting (initial version returns all)
- Authentication and authorization
- AI story generation (source.type="ai" supported in schema but not implemented)
- Rich text editing
- Filtering/search APIs (frontend can filter client-side initially)

**Assumptions:**
- MongoDB is available (local or Docker: `docker run -d -p 27017:27017 mongo:7`)
- Initial stories are "static" source type with createdBy="system"
- Status defaults to "published" for now (draft/archived support in schema but not UI)
- Language defaults to "en"

## Architecture

```
Frontend (React + TS)
  ├─ StoryForm.tsx ──────> POST /api/stories
  └─ StoryList.tsx ──────> GET /api/stories
                              │
                              ▼
Backend (Spring Boot)
  Controller ──> Service ──> Repository ──> MongoDB
```

**Data Flow:**
1. User enters story in StoryForm → calls storyService.createStory()
2. Frontend sends POST to /api/stories
3. StoryController receives request → StoryService validates & saves
4. StoryRepository persists to MongoDB
5. StoryList fetches stories via GET /api/stories on mount
6. Backend returns list → frontend renders

## Non-Functional Requirements (NFRs)

• **Performance**: Stories list loads in <500ms for <100 records (no pagination yet)
• **Security**: Basic input validation; sanitize HTML in content if rendered
• **Logging**: Log story creation and fetch operations at INFO level
• **Error Handling**: Return 400 for validation errors, 500 for DB failures
• **CORS**: Enable CORS for localhost:5173 (frontend dev server)

## Implementation Phases

### Phase 1: Backend - MongoDB Setup & Story Model
**Files**: 
- `backend/pom.xml`
- `backend/src/main/java/com/momandme/model/Story.java`
- `backend/src/main/resources/application.properties`

**Responsibilities**: Add MongoDB dependency, define Story entity with @Document annotation, configure MongoDB connection string.

**Acceptance Criteria**: 
- [ ] MongoDB dependency added to pom.xml
- [ ] Story entity created with all fields: title, content, ageGroup (min/max), durationMinutes, tags, moral, language, source (type/referenceId), status, createdBy, createdAt, updatedAt
- [ ] AgeGroup and Source as embedded static classes within Story
- [ ] application.properties contains MongoDB URI (e.g., mongodb://localhost:27017/momandme)

**Key Changes**:
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

```java
// Story.java
@Document(collection = "stories")
public class Story {
    @Id
    private String id;
    private String title;
    private String content;
    private AgeGroup ageGroup;
    private Integer durationMinutes;
    private List<String> tags;
    private String moral;
    private String language;
    private Source source;
    private String status; // draft | published | archived
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Embedded classes
    public static class AgeGroup {
        private Integer min;
        private Integer max;
        // getters, setters
    }
    
    public static class Source {
        private String type; // static | ai | user
        private String referenceId;
        // getters, setters
    }
}
```

**Risks**: MongoDB not running → mitigate with clear error message and docker-compose setup guide.

**Dependencies**: None

---

### Phase 2: Backend - Repository & Service Layer
**Files**: 
- `backend/src/main/java/com/momandme/repository/StoryRepository.java`
- `backend/src/main/java/com/momandme/service/StoryService.java`

**Test Files**:
- `backend/src/test/java/com/momandme/service/StoryServiceTest.java`

**Responsibilities**: Create Spring Data repository interface and service class with business logic for creating and fetching stories. Write unit tests for service layer.

**Acceptance Criteria**: 
- [ ] StoryRepository extends MongoRepository<Story, String>
- [ ] StoryService has createStory(StoryRequest) and getAllStories() methods
- [ ] Constructor injection for StoryRepository
- [ ] Service sets createdAt/updatedAt timestamps, defaults for status ("published"), createdBy ("system"), language ("en" if not provided), source (type="static")
- [ ] Unit tests verify default values are set correctly
- [ ] Unit tests verify repository.save() is called with correct Story object
- [ ] Unit tests cover both createStory and getAllStories methods

**Key Changes**:
```java
// StoryRepository.java
public interface StoryRepository extends MongoRepository<Story, String> {
}

// StoryService.java
@Service
public class StoryService {
    private final StoryRepository repository;
    
    public StoryService(StoryRepository repository) {
        this.repository = repository;
    }
    
    public Story createStory(StoryRequest request) {
        Story story = new Story();
        story.setTitle(request.getTitle());
        story.setContent(request.getContent());
        story.setAgeGroup(request.getAgeGroup());
        story.setDurationMinutes(request.getDurationMinutes());
        story.setTags(request.getTags());
        story.setMoral(request.getMoral());
        story.setLanguage(request.getLanguage() != null ? request.getLanguage() : "en");
        story.setStatus(request.getStatus() != null ? request.getStatus() : "published");
        story.setCreatedBy("system");
        
        Story.Source source = new Story.Source();
        source.setType("static");
        source.setReferenceId(null);
        story.setSource(source);
        
        LocalDateTime now = LocalDateTime.now();
        story.setCreatedAt(now);
        story.setUpdatedAt(now);
        
        return repository.save(story);
    }
    
    public List<Story> getAllStories() {
        return repository.findAll();
    }
}

// StoryServiceTest.java
@ExtendWith(MockitoExtension.class)
class StoryServiceTest {
    @Mock
    private StoryRepository repository;
    
    @InjectMocks
    private StoryService service;
    
    @Test
    void createStory_setsDefaultValues() {
        StoryRequest request = new StoryRequest();
        request.setTitle("Test Story");
        request.setContent("Test content");
        Story.AgeGroup ageGroup = new Story.AgeGroup();
        ageGroup.setMin(4);
        ageGroup.setMax(6);
        request.setAgeGroup(ageGroup);
        request.setDurationMinutes(5);
        request.setTags(List.of("bedtime"));
        request.setMoral("Test moral");
        
        when(repository.save(any(Story.class))).thenAnswer(i -> i.getArgument(0));
        
        Story result = service.createStory(request);
        
        assertThat(result.getLanguage()).isEqualTo("en");
        assertThat(result.getStatus()).isEqualTo("published");
        assertThat(result.getCreatedBy()).isEqualTo("system");
        assertThat(result.getSource().getType()).isEqualTo("static");
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(repository).save(any(Story.class));
    }
    
    @Test
    void getAllStories_returnsAllFromRepository() {
        List<Story> expected = List.of(new Story(), new Story());
        when(repository.findAll()).thenReturn(expected);
        
        List<Story> result = service.getAllStories();
        
        assertThat(result).isEqualTo(expected);
        verify(repository).findAll();
    }
}
```

**Risks**: None

**Dependencies**: Phase 1 must be complete

---

### Phase 3: Backend - REST Controller & CORS
**Files**: 
- `backend/src/main/java/com/momandme/controller/StoryController.java`
- `backend/src/main/java/com/momandme/config/WebConfig.java`

**Test Files**:
- `backend/src/test/java/com/momandme/controller/StoryControllerTest.java`

**Responsibilities**: Expose REST endpoints for story operations, enable CORS for frontend access. Write controller integration tests using MockMvc.

**Acceptance Criteria**: 
- [ ] POST /api/stories accepts StoryRequest with title, content, ageGroup, durationMinutes, tags, moral, language, status
- [ ] GET /api/stories returns all stories as JSON array with full metadata
- [ ] CORS enabled for http://localhost:5173
- [ ] Validation: title, content, ageGroup.min, ageGroup.max required; tags can be empty list; language/status have defaults
- [ ] MockMvc tests verify POST returns 200 with created story JSON
- [ ] MockMvc tests verify GET returns 200 with story array
- [ ] Test validates error response for missing required fields

**Key Changes**:
```java
// StoryRequest.java (DTO)
public class StoryRequest {
    private String title;
    private String content;
    private Story.AgeGroup ageGroup;
    private Integer durationMinutes;
    private List<String> tags;
    private String moral;
    private String language;
    private String status;
    // getters, setters
}

// StoryController.java
@RestController
@RequestMapping("/api/stories")
public class StoryController {
    private final StoryService service;
    
    public StoryController(StoryService service) {
        this.service = service;
    }
    
    @PostMapping
    public Story create(@RequestBody StoryRequest request) {
        return service.createStory(request);
    }
    
    @GetMapping
    public List<Story> getAll() {
        return service.getAllStories();
    }
}

// WebConfig.java (CORS)
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST");
    }
}

// StoryControllerTest.java
@WebMvcTest(StoryController.class)
class StoryControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private StoryService service;
    
    @Test
    void createStory_returnsCreatedStory() throws Exception {
        Story story = new Story();
        story.setId("123");
        story.setTitle("Test Story");
        story.setContent("Content");
        
        when(service.createStory(any(StoryRequest.class))).thenReturn(story);
        
        mockMvc.perform(post("/api/stories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test Story\",\"content\":\"Content\",\"ageGroup\":{\"min\":4,\"max\":6},\"durationMinutes\":5,\"tags\":[],\"moral\":\"Test\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("123"))
            .andExpect(jsonPath("$.title").value("Test Story"));
    }
    
    @Test
    void getAllStories_returnsStoryList() throws Exception {
        Story story1 = new Story();
        story1.setId("1");
        story1.setTitle("Story 1");
        
        when(service.getAllStories()).thenReturn(List.of(story1));
        
        mockMvc.perform(get("/api/stories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("1"))
            .andExpect(jsonPath("$[0].title").value("Story 1"));
    }
}
```

**Risks**: CORS misconfiguration → test with frontend early

**Dependencies**: Phase 2 complete

---

### Phase 4: Frontend - TypeScript Types & API Service
**Files**: 
- `frontend/src/types/Story.ts`
- `frontend/src/services/storyService.ts`

**Test Files**:
- `frontend/src/services/storyService.test.ts`

**Responsibilities**: Define TypeScript Story type and API client functions for create/fetch. Write unit tests for API service with mocked fetch.

**Acceptance Criteria**: 
- [ ] Story type matches backend model with all fields including nested ageGroup and source
- [ ] CreateStoryRequest type for POST payload
- [ ] createStory(request) function calls POST /api/stories with full payload
- [ ] fetchStories() function calls GET /api/stories
- [ ] Error handling for network failures
- [ ] Unit tests mock global fetch and verify API calls
- [ ] Tests verify correct request body and headers
- [ ] Tests verify error handling for failed responses

**Key Changes**:
```typescript
// Story.ts
export interface Story {
  id: string;
  title: string;
  content: string;
  ageGroup: {
    min: number;
    max: number;
  };
  durationMinutes: number;
  tags: string[];
  moral: string;
  language: string;
  source: {
    type: 'static' | 'ai' | 'user';
    referenceId: string | null;
  };
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoryRequest {
  title: string;
  content: string;
  ageGroup: { min: number; max: number };
  durationMinutes: number;
  tags: string[];
  moral: string;
  language?: string;
  status?: string;
}

// storyService.ts
const API_BASE = 'http://localhost:8080/api';

export async function createStory(request: CreateStoryRequest): Promise<Story> {
  const response = await fetch(`${API_BASE}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to create story');
  return response.json();
}

export async function fetchStories(): Promise<Story[]> {
  const response = await fetch(`${API_BASE}/stories`);
  if (!response.ok) throw new Error('Failed to fetch stories');
  return response.json();
}

// storyService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStory, fetchStories } from './storyService';
import type { CreateStoryRequest } from '../types/Story';

global.fetch = vi.fn();

describe('storyService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('createStory sends POST request with correct payload', async () => {
    const mockStory = { id: '123', title: 'Test', content: 'Content', ageGroup: { min: 4, max: 6 } };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockStory,
    });

    const request: CreateStoryRequest = {
      title: 'Test',
      content: 'Content',
      ageGroup: { min: 4, max: 6 },
      durationMinutes: 5,
      tags: ['bedtime'],
      moral: 'Test moral',
    };

    const result = await createStory(request);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/stories',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    );
    expect(result).toEqual(mockStory);
  });

  it('fetchStories sends GET request and returns stories', async () => {
    const mockStories = [{ id: '1', title: 'Story 1' }];
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockStories,
    });

    const result = await fetchStories();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/stories');
    expect(result).toEqual(mockStories);
  });

  it('throws error when fetch fails', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });

    await expect(fetchStories()).rejects.toThrow('Failed to fetch stories');
  });
});
```

**Risks**: Backend URL hardcoded → document environment variable option for production

**Dependencies**: Phase 3 complete

---

### Phase 5: Frontend - StoryForm Component
**Files**: 
- `frontend/src/components/StoryForm.tsx`

**Test Files**:
- `frontend/src/components/StoryForm.test.tsx`

**Responsibilities**: Provide form UI for creating new stories with all metadata fields: title, content, age range, duration, tags, moral, language. Write component tests with React Testing Library.

**Acceptance Criteria**: 
- [ ] Form has inputs for title, content, ageMin, ageMax, durationMinutes, tags (comma-separated), moral, language
- [ ] Submit button calls createStory() with CreateStoryRequest object
- [ ] Form clears after successful submission
- [ ] Validation: title, content, ageMin, ageMax required; tags parsed from comma-separated string
- [ ] Component tests render form correctly
- [ ] Tests verify form submission calls createStory with correct data
- [ ] Tests verify form resets after successful submission

**Key Changes**:
```typescript
import React, { useState } from 'react';
import { createStory } from '../services/storyService';
import type { CreateStoryRequest } from '../types/Story';

export default function StoryForm({ onStoryCreated }: { onStoryCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ageMin, setAgeMin] = useState<number>(3);
  const [ageMax, setAgeMax] = useState<number>(6);
  const [duration, setDuration] = useState<number>(5);
  const [tagsInput, setTagsInput] = useState('');
  const [moral, setMoral] = useState('');
  const [language, setLanguage] = useState('en');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    const request: CreateStoryRequest = {
      title,
      content,
      ageGroup: { min: ageMin, max: ageMax },
      durationMinutes: duration,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      moral,
      language,
    };
    
    try {
      await createStory(request);
      // Reset form
      setTitle('');
      setContent('');
      setAgeMin(3);
      setAgeMax(6);
      setDuration(5);
      setTagsInput('');
      setMoral('');
      onStoryCreated();
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required />
      <input type="number" value={ageMin} onChange={e => setAgeMin(+e.target.value)} placeholder="Min Age" required />
      <input type="number" value={ageMax} onChange={e => setAgeMax(+e.target.value)} placeholder="Max Age" required />
      <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} placeholder="Duration (min)" />
      <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Tags (comma-separated)" />
      <input value={moral} onChange={e => setMoral(e.target.value)} placeholder="Moral" />
      <button type="submit">Add Story</button>
    </form>
  );
}

// StoryForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoryForm from './StoryForm';
import * as storyService from '../services/storyService';

vi.mock('../services/storyService');

describe('StoryForm', () => {
  it('renders all form fields', () => {
    render(<StoryForm onStoryCreated={vi.fn()} />);
    
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min Age')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max Age')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Duration (min)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tags (comma-separated)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Moral')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const mockCreateStory = vi.spyOn(storyService, 'createStory').mockResolvedValue({} as any);
    const onStoryCreated = vi.fn();
    
    render(<StoryForm onStoryCreated={onStoryCreated} />);
    
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Story' } });
    fireEvent.change(screen.getByPlaceholderText('Content'), { target: { value: 'Test content' } });
    fireEvent.change(screen.getByPlaceholderText('Tags (comma-separated)'), { target: { value: 'bedtime, calm' } });
    fireEvent.change(screen.getByPlaceholderText('Moral'), { target: { value: 'Be kind' } });
    
    fireEvent.click(screen.getByText('Add Story'));
    
    await waitFor(() => {
      expect(mockCreateStory).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Story',
          content: 'Test content',
          tags: ['bedtime', 'calm'],
          moral: 'Be kind',
        })
      );
      expect(onStoryCreated).toHaveBeenCalled();
    });
  });

  it('clears form after successful submission', async () => {
    vi.spyOn(storyService, 'createStory').mockResolvedValue({} as any);
    
    render(<StoryForm onStoryCreated={vi.fn()} />);
    
    const titleInput = screen.getByPlaceholderText('Title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Content'), { target: { value: 'Content' } });
    fireEvent.click(screen.getByText('Add Story'));
    
    await waitFor(() => {
      expect(titleInput.value).toBe('');
    });
  });
});
```

**Risks**: None

**Dependencies**: Phase 4 complete

---

### Phase 6: Frontend - StoryList Component & Integration
**Files**: 
- `frontend/src/components/StoryList.tsx`
- `frontend/src/App.tsx`

**Test Files**:
- `frontend/src/components/StoryList.test.tsx`

**Responsibilities**: Display fetched stories with all metadata, integrate form and list into App.tsx. Write component tests for story rendering.

**Acceptance Criteria**: 
- [ ] StoryList fetches stories on mount via fetchStories()
- [ ] Stories displayed with title, content, age range, duration, tags, moral, language, createdAt
- [ ] App.tsx contains StoryForm and StoryList
- [ ] List refreshes after new story added
- [ ] Component tests verify stories are fetched and rendered
- [ ] Tests verify all story metadata is displayed correctly
- [ ] Tests verify list re-fetches when refresh prop changes

**Key Changes**:
```typescript
// StoryList.tsx
import React, { useEffect, useState } from 'react';
import { fetchStories } from '../services/storyService';
import type { Story } from '../types/Story';

export default function StoryList({ refresh }: { refresh: number }) {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    fetchStories().then(setStories).catch(console.error);
  }, [refresh]);

  return (
    <div>
      {stories.map(story => (
        <article key={story.id}>
          <h3>{story.title}</h3>
          <p>{story.content}</p>
          <div>
            <span>Age: {story.ageGroup.min}-{story.ageGroup.max}</span>
            <span> | Duration: {story.durationMinutes} min</span>
            <span> | Language: {story.language}</span>
          </div>
          {story.tags.length > 0 && (
            <div>Tags: {story.tags.join(', ')}</div>
          )}
          {story.moral && <div>Moral: {story.moral}</div>}
          <small>{new Date(story.createdAt).toLocaleDateString()}</small>
        </article>
      ))}
    </div>
  );
}

// StoryList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StoryList from './StoryList';
import * as storyService from '../services/storyService';
import type { Story } from '../types/Story';

vi.mock('../services/storyService');

describe('StoryList', () => {
  const mockStories: Story[] = [
    {
      id: '1',
      title: 'Test Story',
      content: 'Test content',
      ageGroup: { min: 4, max: 6 },
      durationMinutes: 5,
      tags: ['bedtime', 'calm'],
      moral: 'Be kind',
      language: 'en',
      source: { type: 'static', referenceId: null },
      status: 'published',
      createdBy: 'system',
      createdAt: '2026-02-05T10:00:00Z',
      updatedAt: '2026-02-05T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and displays stories', async () => {
    vi.spyOn(storyService, 'fetchStories').mockResolvedValue(mockStories);
    
    render(<StoryList refresh={0} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Story')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByText(/Age: 4-6/)).toBeInTheDocument();
      expect(screen.getByText(/Duration: 5 min/)).toBeInTheDocument();
      expect(screen.getByText(/Tags: bedtime, calm/)).toBeInTheDocument();
      expect(screen.getByText(/Moral: Be kind/)).toBeInTheDocument();
    });
  });

  it('refetches stories when refresh prop changes', async () => {
    const fetchStoriesSpy = vi.spyOn(storyService, 'fetchStories').mockResolvedValue(mockStories);
    
    const { rerender } = render(<StoryList refresh={0} />);
    await waitFor(() => expect(fetchStoriesSpy).toHaveBeenCalledTimes(1));
    
    rerender(<StoryList refresh={1} />);
    await waitFor(() => expect(fetchStoriesSpy).toHaveBeenCalledTimes(2));
  });

  it('handles empty story list', async () => {
    vi.spyOn(storyService, 'fetchStories').mockResolvedValue([]);
    
    render(<StoryList refresh={0} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });
  });
});
```
import StoryForm from './components/StoryForm';
import StoryList from './components/StoryList';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <main>
      <h1>MomAndMe Stories</h1>
      <StoryForm onStoryCreated={() => setRefreshKey(k => k + 1)} />
      <StoryList refresh={refreshKey} />
    </main>
  );
}
```

**Risks**: None

**Dependencies**: Phase 5 complete

---

## Testing Strategy

• **Backend unit tests** (JUnit + Mockito): 
  - StoryService: test createStory sets defaults, getAllStories returns from repository
  - StoryController: test endpoints with MockMvc, verify JSON responses

• **Frontend unit tests** (Vitest + React Testing Library):
  - storyService: mock fetch, verify API calls with correct payloads
  - StoryForm: verify form submission, input handling, reset after submit
  - StoryList: verify stories render correctly, refresh on prop change

• **Integration tests**: 
  - Test full flow: POST story → verify in MongoDB → GET stories returns it

• **Manual tests**:
  - Start MongoDB, backend, frontend
  - Create story via form
  - Verify story appears in list
  - Check MongoDB contains document

• **Edge cases**: 
  - Empty title/content → validation error
  - MongoDB down → 500 error with message
  - Network failure in frontend → error handling

## Risks & Rollback

• **Risk**: MongoDB not installed/running locally  
  **Mitigation**: Provide docker-compose.yml or clear setup docs; detect connection failure early

• **Risk**: CORS issues blocking frontend  
  **Mitigation**: Test CORS config immediately in Phase 3; allow localhost:5173 explicitly

• **Rollback**: Remove MongoDB dependency, delete story-related classes, revert frontend changes

## Success Metrics

- [ ] Backend starts without errors with MongoDB running
- [ ] POST /api/stories creates a story and returns 200
- [ ] GET /api/stories returns created story
- [ ] Frontend form successfully submits and clears
- [ ] Story appears in frontend list immediately after creation
- [ ] MongoDB contains story document viewable via Compass or CLI

## Open Questions

• Should we add pagination for stories list? (Answer: not in initial scope)
• Do we need update/delete endpoints? (Answer: not in Phase 1)
• Authentication required? (Answer: not in initial scope, stories are public)
