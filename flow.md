flowchart TB
    subgraph Landing["🏠 Landing Page"]
        Home["/"]
    end

    subgraph Auth["🔐 Authentication"]
        SignIn["/signin"]
        SignUp["/signup"]
    end

    subgraph Onboarding["📝 Onboarding"]
        OnboardStudent["/onboarding/student"]
        OnboardBusiness["/onboarding/business"]
    end

    subgraph StudentFlow["🎓 Guide/Student Flow"]
        StudentDash["/student/dashboard"]
        StudentPrevTours["/previous-tours"]
        StudentPrevTourDetail["/previous-tours/[id]"]
        GuideProfile["/guide/[id]"]
    end

    subgraph BusinessFlow["🏢 Organization/Business Flow"]
        BusinessDash["/business/dashboard"]
        CreateTour["/business/create-tour"]
        EditTour["/business/edit-tour/[id]"]
        LeaveRequests["/business/leave-requests"]
        BizPrevTours["/previous-tours"]
        BizPrevTourDetail["/previous-tours/[id]"]
    end

    subgraph SharedPages["📄 Shared Pages"]
        TourDetail["/tour/[id]"]
        Account["/account"]
        Settings["Settings Modal"]
    end

    %% Landing to Auth
    Home -->|"Sign In"| SignIn
    Home -->|"Sign Up"| SignUp

    %% Auth to Onboarding/Dashboard
    SignUp -->|"New Student"| OnboardStudent
    SignUp -->|"New Business"| OnboardBusiness
    SignIn -->|"Existing Student"| StudentDash
    SignIn -->|"Existing Business"| BusinessDash
    
    %% Onboarding to Dashboard
    OnboardStudent --> StudentDash
    OnboardBusiness --> BusinessDash

    %% Student Dashboard Navigation
    StudentDash -->|"View Tour"| TourDetail
    StudentDash -->|"Previous Tours"| StudentPrevTours
    StudentDash -->|"View Profile"| GuideProfile
    StudentPrevTours -->|"Tour Details"| StudentPrevTourDetail
    
    %% Tour Detail - Student Actions
    TourDetail -->|"Apply as Guide"| TourDetail
    TourDetail -->|"Leave Tour"| TourDetail
    TourDetail -->|"View Guide"| GuideProfile

    %% Business Dashboard Navigation
    BusinessDash -->|"Create Tour"| CreateTour
    BusinessDash -->|"Edit Tour"| EditTour
    BusinessDash -->|"View Tour"| TourDetail
    BusinessDash -->|"Previous Tours"| BizPrevTours
    BusinessDash -->|"Leave Requests"| LeaveRequests
    BizPrevTours -->|"Tour Details"| BizPrevTourDetail
    CreateTour -->|"Save"| BusinessDash
    EditTour -->|"Save"| BusinessDash

    %% Previous Tour Detail Actions
    BizPrevTourDetail -->|"Upload Feedback"| BizPrevTourDetail
    BizPrevTourDetail -->|"Generate AI Summary"| BizPrevTourDetail
    BizPrevTourDetail -->|"Edit Total Travelers"| BizPrevTourDetail

    %% Tour Detail - Business Actions
    TourDetail -->|"Edit Tour"| EditTour
    TourDetail -->|"Approve/Reject Applicant"| TourDetail

    %% Header Navigation (Both Roles)
    StudentDash -.->|"Header"| Account
    StudentDash -.->|"Header"| Settings
    BusinessDash -.->|"Header"| Account
    BusinessDash -.->|"Header"| Settings

    %% Logout
    Settings -.->|"Logout"| Home
    Account -.->|"Logout"| Home

    %% Styling
    classDef landing fill:#e1f5fe,stroke:#01579b
    classDef auth fill:#fff3e0,stroke:#e65100
    classDef student fill:#e8f5e9,stroke:#2e7d32
    classDef business fill:#fce4ec,stroke:#c2185b
    classDef shared fill:#f3e5f5,stroke:#7b1fa2
    classDef onboard fill:#fff8e1,stroke:#f57f17

    class Home landing
    class SignIn,SignUp auth
    class OnboardStudent,OnboardBusiness onboard
    class StudentDash,StudentPrevTours,StudentPrevTourDetail,GuideProfile student
    class BusinessDash,CreateTour,EditTour,LeaveRequests,BizPrevTours,BizPrevTourDetail business
    class TourDetail,Account,Settings shared