"use client"

import { useState } from "react";
import Header from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Label } from "~/components/ui/label";
import EmailVerificationModal from "~/components/EmailVerificationModal";
import UnsavedChangesModal from "~/components/UnsavedChangesModal";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  Building2,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react";

type UserRole = "student" | "business";

interface BaseUserData {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  rating: number;
  avatar: string;
  biography: string;
}

interface StudentData extends BaseUserData {
  university: string;
  major: string;
  year: string;
  languages: string[];
  toursCompleted: number;
  certifications: string[];
}

interface BusinessData extends BaseUserData {
  companyType: string;
  website: string;
  description: string;
  toursOffered: number;
  services: string[];
}

const Account = () => {
  const [userRole] = useState<UserRole>("student");
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const router = useRouter()

  const [editableData, setEditableData] = useState({
    student: {
      name: "Jane Doe",
      email: "jane.doe@university.edu",
      phone: "+1 (555) 123-4567",
      location: "Rome, Italy",
      joinDate: "March 2024",
      university: "University of Rome",
      major: "Tourism Management",
      year: "3rd Year",
      languages: ["English", "Italian", "Spanish"],
      toursCompleted: 12,
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      biography: "Passionate tourism student with a love for cultural exchange and creating memorable experiences for travelers.",
      certifications: ["First Aid Certified", "Tour Guide License"]
    } as StudentData,
    business: {
      name: "Rome Adventures Co.",
      email: "contact@romeadventures.com",
      phone: "+39 06 123 4567",
      location: "Rome, Italy",
      joinDate: "January 2023",
      companyType: "Tour Operator",
      website: "www.romeadventures.com",
      description: "Authentic Roman experiences since 2020",
      toursOffered: 25,
      rating: 4.6,
      avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop",
      biography: "Leading tour company specializing in authentic Roman experiences and cultural immersion.",
      services: ["Walking Tours", "Food Tours", "Private Experiences"]
    } as BusinessData
  });

  const userData = editableData[userRole];

  const getRoleIcon = () => {
    switch (userRole) {
      case "student":
        return <GraduationCap className="w-5 h-5" />;
      case "business":
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "student":
        return "Tourism Student";
      case "business":
        return "Business Partner";
    }
  };

  const handleNavigateAway = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      router.push(path);
    }
  };

  const handleSaveChanges = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationComplete = () => {
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setShowVerificationModal(false);
  };

  const addArrayItem = (field: string, newItem: string) => {
    if (!newItem.trim()) return;
    
    const currentValue = (userData as any)[field];
    if (Array.isArray(currentValue)) {
      setEditableData(prev => ({
        ...prev,
        [userRole]: {
          ...prev[userRole],
          [field]: [...currentValue, newItem]
        }
      }));
      setHasUnsavedChanges(true);
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentValue = (userData as any)[field];
    if (Array.isArray(currentValue)) {
      setEditableData(prev => ({
        ...prev,
        [userRole]: {
          ...prev[userRole],
          [field]: currentValue.filter((_, i) => i !== index)
        }
      }));
      setHasUnsavedChanges(true);
    }
  };

  const updateField = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [userRole]: {
        ...prev[userRole],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  return (
      <>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => handleNavigateAway(userRole === "student" ? "/student/dashboard" : 
                                           userRole === "business" ? "/business/dashboard" : 
                                           "/traveler/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} variant="gradient">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (hasUnsavedChanges) {
                    setShowUnsavedModal(true);
                  } else {
                    setIsEditMode(false);
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} variant="gradient" disabled={!hasUnsavedChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Professional Profile Header */}
        <Card className="mb-8 shadow-elevated">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-3xl bg-gradient-primary text-primary-foreground">
                    {userData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className="flex items-center gap-2">
                  {getRoleIcon()}
                  {getRoleLabel()}
                </Badge>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  {isEditMode ? (
                    <Input
                      value={userData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="text-3xl font-bold border-0 p-0 bg-transparent focus-visible:ring-1"
                      placeholder="Full Name"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {isEditMode ? (
                        <Input
                          value={userData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          className="border-0 p-0 bg-transparent focus-visible:ring-1 w-auto"
                          placeholder="email@example.com"
                        />
                      ) : (
                        <span>{userData.email}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {isEditMode ? (
                        <Input
                          value={userData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          className="border-0 p-0 bg-transparent focus-visible:ring-1 w-auto"
                          placeholder="+1 (555) 000-0000"
                        />
                      ) : (
                        <span>{userData.phone}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {isEditMode ? (
                        <Input
                          value={userData.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          className="border-0 p-0 bg-transparent focus-visible:ring-1 w-auto"
                          placeholder="City, Country"
                        />
                      ) : (
                        <span>{userData.location}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {userData.joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* Biography Section */}
                <div>
                  <h3 className="font-semibold mb-2">Biography</h3>
                  {isEditMode ? (
                    <Textarea
                      value={userData.biography}
                      onChange={(e) => updateField("biography", e.target.value)}
                      placeholder="Write a professional biography..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-muted-foreground">{userData.biography}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <ProfessionalSection 
            title="Contact Information"
            icon={<User className="w-5 h-5" />}
            isEditMode={isEditMode}
            userData={userData}
            updateField={updateField}
          />

          {/* Role-specific Information */}
          <RoleSpecificSection
            userRole={userRole}
            userData={userData}
            isEditMode={isEditMode}
            updateField={updateField}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        </div>

        {/* Activity Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">
                  {userRole === "student" && (userData as StudentData).toursCompleted}
                  {userRole === "business" && (userData as BusinessData).toursOffered}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {userRole === "student" && "Tours Completed"}
                  {userRole === "business" && "Tours Offered"}
                </p>
              </div>
              
              <div className="text-center p-6 bg-accent/5 rounded-lg border border-accent/20">
                <div className="text-3xl font-bold text-accent mb-2">{userData.rating}</div>
                <p className="text-sm text-muted-foreground font-medium">Average Rating</p>
              </div>
              
              <div className="text-center p-6 bg-muted/50 rounded-lg border">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {userData.joinDate.split(" ")[1]}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Member Since</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <UnsavedChangesModal
          open={showUnsavedModal}
          onOpenChange={setShowUnsavedModal}
          onLeave={() => {
            setIsEditMode(false);
            setHasUnsavedChanges(false);
            setShowUnsavedModal(false);
            if (pendingNavigation) {
              router.push(pendingNavigation);
            }
          }}
        />

        {/* <EmailVerificationModal
          open={showVerificationModal}
          onOpenChange={setShowVerificationModal}
          onVerify={handleVerificationComplete}
        /> */}
      </div>
    </>
  );
};

// Helper Components
const ProfessionalSection = ({ title, icon, isEditMode, userData, updateField }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
        {isEditMode ? (
          <Input
            value={userData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="mt-1"
          />
        ) : (
          <p className="text-sm mt-1">{userData.phone}</p>
        )}
      </div>
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
        {isEditMode ? (
          <Input
            value={userData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="mt-1"
          />
        ) : (
          <p className="text-sm mt-1">{userData.email}</p>
        )}
      </div>
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Location</Label>
        {isEditMode ? (
          <Input
            value={userData.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="mt-1"
          />
        ) : (
          <p className="text-sm mt-1">{userData.location}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const RoleSpecificSection = ({ userRole, userData, isEditMode, updateField, addArrayItem, removeArrayItem }: any) => {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = (field: string) => {
    if (newItem.trim()) {
      addArrayItem(field, newItem.trim());
      setNewItem("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {userRole === "student" && <GraduationCap className="w-5 h-5" />}
          {userRole === "business" && <Building2 className="w-5 h-5" />}
          {userRole === "student" && "Academic Information"}
          {userRole === "business" && "Business Information"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userRole === "student" && (
          <>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">University</Label>
              {isEditMode ? (
                <Input
                  value={(userData as StudentData).university}
                  onChange={(e) => updateField("university", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{(userData as StudentData).university}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Major</Label>
              {isEditMode ? (
                <Input
                  value={(userData as StudentData).major}
                  onChange={(e) => updateField("major", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{(userData as StudentData).major}</p>
              )}
            </div>
            <ArrayField 
              label="Languages"
              items={(userData as StudentData).languages}
              isEditMode={isEditMode}
              onAdd={(item) => addArrayItem("languages", item)}
              onRemove={(index) => removeArrayItem("languages", index)}
            />
            <ArrayField 
              label="Certifications"
              items={(userData as StudentData).certifications}
              isEditMode={isEditMode}
              onAdd={(item) => addArrayItem("certifications", item)}
              onRemove={(index) => removeArrayItem("certifications", index)}
            />
          </>
        )}
        
        {userRole === "business" && (
          <>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Company Type</Label>
              {isEditMode ? (
                <Input
                  value={(userData as BusinessData).companyType}
                  onChange={(e) => updateField("companyType", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{(userData as BusinessData).companyType}</p>
              )}
            </div>
            <ArrayField 
              label="Services"
              items={(userData as BusinessData).services}
              isEditMode={isEditMode}
              onAdd={(item) => addArrayItem("services", item)}
              onRemove={(index) => removeArrayItem("services", index)}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ArrayField = ({ label, items, isEditMode, onAdd, onRemove }: any) => {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem("");
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="mt-1">
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item: string, index: number) => (
            <div key={index} className="flex items-center">
              <Badge variant="outline" className="text-xs">
                {item}
                {isEditMode && (
                  <button
                    onClick={() => onRemove(index)}
                    className="m l-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            </div>
          ))}
        </div>
        {isEditMode && (
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`Add ${label.toLowerCase()}...`}
              className="text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button size="sm" onClick={handleAdd} disabled={!newItem.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;