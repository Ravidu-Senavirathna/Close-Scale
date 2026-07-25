# Users / Actors

Based on your scenario, you have 5 main user types:

- Sales Representative
- Sales Manager
- Marketing Executive
- Delivery Management Team
- Leadership / CEO / Directors

System Administrator (technical user)

## 1. Sales Representative

**Description:**

The person who communicates with customers, manages leads, updates deals, and performs follow-ups.

**Responsibilities:**

- Manage assigned customers
- Contact leads
- Record calls, meetings, and emails
- Update deal stages
- Schedule follow-ups
- Track personal performance
- User Stories
- Customer Management

As a Sales Representative, I want to view customer information so that I can understand the customer's background before contacting them.

**Acceptance Criteria:**

- Can view company details
- Can view contact persons
- Can see previous interactions
- Lead Management

As a Sales Representative, I want to view my assigned leads so that I can prioritize potential customers.

**Acceptance Criteria:**

- Can see lead name
- Can see lead status
- Can filter leads by priority
- Communication Tracking

As a Sales Representative, I want to log customer interactions so that the conversation history is available for future reference.

**Acceptance Criteria:**

- Can record calls
- Can add meeting notes
- Can add email summaries
- Activity appears in customer timeline
- Deal Management

As a Sales Representative, I want to update deal stages so that I can track the progress of my opportunities.

**Acceptance Criteria:**

- Can move deals between stages
- Can update expected closing date
- Can update deal value
- Reminder Management

As a Sales Representative, I want to receive follow-up reminders so that I do not miss customer commitments.

**Acceptance Criteria:**

- Can create reminders
- System shows upcoming tasks
- Notifications appear before deadlines

## 2. Sales Manager

**Description:**

Responsible for supervising sales representatives, monitoring pipeline, and improving team performance.

**Responsibilities:**

- Assign leads and accounts
- Monitor sales pipeline
- Track team performance
- Identify stuck deals
- User Stories
- Team Management

As a Sales Manager, I want to assign leads to sales representatives so that customer opportunities are handled by the correct person.

**Acceptance Criteria:**

- Can assign leads
- Can change ownership
- Sales representative receives notification
- Pipeline Monitoring

As a Sales Manager, I want to view the sales pipeline so that I can understand the current status of opportunities.

**Acceptance Criteria:**

- Can view deals by stage
- Can identify delayed deals
- Can see expected revenue
- Performance Tracking

As a Sales Manager, I want to view sales performance reports so that I can evaluate my team's progress.

**Acceptance Criteria:**

- View number of leads
- View conversion rate
- View closed deals
- Deal Monitoring

As a Sales Manager, I want to identify cold or stuck deals so that I can take corrective action.

**Acceptance Criteria:**

- System highlights inactive deals
- Shows last interaction date
- Shows responsible salesperson

## 3. Project Manager

**Description:**

Responsible for managing client projects after a sales deal is won. The Project Manager reviews customer requirements, tracks project progress, and coordinates with the development team to ensure successful project delivery.

**Responsibilities:**

- View customer and project information
- Review project requirements and client discussions
- Create and manage projects for won deals
- Update project status
- Assign developers to projects (optional)
- Add project notes and milestones
- Monitor project progress

As a Project Manager, I want to create a project from a won deal so that development work can begin.

**Acceptance Criteria:**

- Can create a project from a closed-won deal
- Can enter project name and description
- Can assign project start and end dates
- Project is linked to the customer and deal
- Project Progress Tracking

As a Project Manager, I want to update the project status so that everyone knows the current progress of the project.

**Acceptance Criteria:**

- Can update project status (Not Started, In Progress, On Hold, Completed)
- Can add progress notes
- Status updates are visible to authorized users
- View Customer Requirements

As a Project Manager, I want to view customer information and previous communications so that I clearly understand the client's requirements before the project starts.

**Acceptance Criteria:**

- Can view customer details
- Can view meeting notes and emails
- Can view project requirements linked to the deal
- Assign Team Members (Optional)

As a Project Manager, I want to assign developers to a project so that responsibilities are clearly defined.

**Acceptance Criteria:**

- Can assign one or more developers
- Can update assigned team members
- Assigned members are visible in the project details
- Project Milestone Management

As a Project Manager, I want to record project milestones so that project progress can be tracked effectively.

**Acceptance Criteria:**

- Can add milestones
- Can update milestone status
- Can mark milestones as completed

## 4. Leadership / CEO / Directors

**Description:**

They require high-level business insights and decision-making information.

**Responsibilities:**

- Monitor company sales performance
- Forecast revenue
- Analyze business growth
- User Stories
- Business Dashboard

As a CEO, I want to view company-wide sales metrics so that I can make strategic decisions.

**Acceptance Criteria:**

- View total pipeline value
- View revenue forecast
- View conversion rates
- Sales Analytics

As a CEO, I want to analyze sales performance so that I can understand business growth.

**Acceptance Criteria:**

- View monthly sales trends
- Compare team performance
- View customer acquisition

## 5. System Administrator

**Description:**

Manages system security, users, and configurations.

**Responsibilities:**

- Create user accounts
- Assign roles
- Manage permissions
- Maintain system
- User Stories
- User Management

As a System Administrator, I want to manage user accounts so that only authorized employees can access CRM data.

**Acceptance Criteria:**

- Create users
- Disable users
- Assign roles
- Security Management

As a System Administrator, I want to control user permissions so that sensitive customer information is protected.

**Acceptance Criteria:**

- Different access levels
- Role-based permissions

# User Story Summary Table

| **User** | **Main Goals** |
|:---|:---|
| **Sales Representative** | Manage customer accounts, create and update leads, manage sales deals, record customer interactions, schedule follow-ups, and maintain strong customer relationships. |
| **Sales Manager** | Assign leads to sales representatives, monitor team performance, oversee the sales pipeline, review conversion rates, and generate sales reports for decision-making. |
| **Project Manager** | Create and manage projects from successfully closed deals, review customer requirements and communication history, monitor project progress, manage milestones, and coordinate with the development team to ensure timely project delivery. |
| **CEO / Leadership** | View company-wide dashboards, monitor sales performance, analyze revenue and conversion rates, track business growth, and use reports to support strategic decision-making. |
| **Administrator** | Manage user accounts, assign roles and permissions, maintain system security, configure CRM settings, and ensure data integrity and system availability. |