import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type CompanyId = Text;
  type EmployeeCode = Text;

  public type PhoneNumber = {
    countryCode : Text;
    number : Text;
  };

  public type Company = {
    id : CompanyId;
    name : Text;
    taxNumber : Text;
    sector : Text;
    address : Text;
    phone : PhoneNumber;
    email : Text;
    authorizedPerson : Text;
    employeeCount : Nat;
    foundingYear : Nat;
    owner : Principal;
    managers : [Principal];
  };

  public type Staff = {
    principal : Principal;
    name : Text;
    projectManager : Text;
    roleCode : Nat;
    companyId : CompanyId;
    employeeCode : EmployeeCode;
  };

  public type UserProfile = {
    name : Text;
    projectManager : Text;
    roleCode : Nat;
    employeeCode : Text;
    companyId : Text;
  };

  public type CompanyProfile = {
    name : Text;
    taxNumber : Text;
    sector : Text;
    address : Text;
    phone : PhoneNumber;
    email : Text;
    authorizedPerson : Text;
    employeeCount : Nat;
    foundingYear : Nat;
  };

  public type Role = {
    name : Text;
    permissions : [Text];
    parentRole : ?Text;
  };

  public type RoleType = {
    #companyOwner;
    #companyManager : ManagerType;
    #companyAdministrator : AdministratorType;
    #companyStaff;
  };

  public type ManagerType = {
    #technical;
    #administrative;
  };

  public type AdministratorType = {
    #technical;
    #administrative;
  };

  public type RoleAssignment = {
    roleName : Text;
    roleType : RoleType;
    principal : Principal;
    companyId : CompanyId;
  };

  public type RoleAssignmentResult = {
    #success;
    #invalidCode;
    #insufficientPermissions;
    #invalidRole;
    #alreadyAssigned;
  };

  // Persistent state
  let companies = Map.empty<CompanyId, Company>();
  let staffMembers = Map.empty<Principal, Staff>();

  let accessControlState = AccessControl.initState();

  // Default roles
  let defaultRoles : [Role] = [
    {
      name = "Company Owner";
      permissions = [
        "Manage company profile",
        "Manage all roles",
        "View financial data",
      ];
      parentRole = null;
    },
    {
      name = "Company Manager";
      permissions = [
        "Manage department",
        "Assign roles to staff",
        "View team performance",
      ];
      parentRole = ?"Company Owner";
    },
    {
      name = "Company Administrator";
      permissions = [
        "Manage system configuration",
        "Oversee business goals",
      ];
      parentRole = ?"Company Manager";
    },
    {
      name = "Company Staff";
      permissions = [
        "Complete own tasks",
        "View personal data",
      ];
      parentRole = ?"Company Manager";
    },
  ];

  include MixinAuthorization(accessControlState);

  // ==========================
  // Required User Profile API
  // ==========================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    switch (staffMembers.get(caller)) {
      case (null) { null };
      case (?staff) {
        ?{
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = staff.roleCode;
          employeeCode = staff.employeeCode;
          companyId = staff.companyId;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    // Users can only view their own profile unless they are admin
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (staffMembers.get(user)) {
      case (null) { null };
      case (?staff) {
        ?{
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = staff.roleCode;
          employeeCode = staff.employeeCode;
          companyId = staff.companyId;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Preserve existing employeeCode and companyId if already registered
    let (employeeCode, companyId) = switch (staffMembers.get(caller)) {
      case (null) {
        // New registration: generate employee code
        let code = generateEmployeeCode(caller);
        (code, "unassigned");
      };
      case (?existing) {
        (existing.employeeCode, existing.companyId);
      };
    };
    let staff : Staff = {
      principal = caller;
      name = profile.name;
      projectManager = profile.projectManager;
      roleCode = profile.roleCode;
      companyId = companyId;
      employeeCode = employeeCode;
    };
    staffMembers.add(caller, staff);
  };

  // ==========================
  // Company Management
  // ==========================

  public query ({ caller }) func isRegisteredAsCompany() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check company registrations");
    };
    switch (findCompanyByOwner(caller)) {
      case (?company) { ?company.id };
      case (null) { null };
    };
  };

  public query ({ caller }) func isEmployeeInCompany(companyId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    switch (staffMembers.get(caller)) {
      case (?staff) { staff.companyId == companyId };
      case (null) { false };
    };
  };

  public query ({ caller }) func getCompany(companyId : Text) : async ?Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view company details");
    };
    // Only company owner, managers, or staff of that company can view it
    switch (companies.get(companyId)) {
      case (null) { null };
      case (?company) {
        if (company.owner == caller) {
          return ?company;
        };
        // Check if caller is a manager
        var isManager = false;
        for (mgr in company.managers.vals()) {
          if (mgr == caller) { isManager := true };
        };
        if (isManager) { return ?company };
        // Check if caller is staff of this company
        switch (staffMembers.get(caller)) {
          case (?staff) {
            if (staff.companyId == companyId) { return ?company };
          };
          case (null) {};
        };
        // Admin can view any company
        if (AccessControl.isAdmin(accessControlState, caller)) {
          return ?company;
        };
        Runtime.trap("Unauthorized: You do not belong to this company");
      };
    };
  };

  public query ({ caller }) func findByOwner(owner : Principal) : async ?Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search companies");
    };
    // Only the owner themselves or an admin can look up by owner
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only look up your own company");
    };
    findCompanyByOwner(owner);
  };

  public query ({ caller }) func findByName(name : Text) : async ?Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search companies");
    };
    var result : ?Company = null;
    for ((_, company) in companies.entries()) {
      if (company.name == name) {
        result := ?company;
      };
    };
    result;
  };

  public query ({ caller }) func findByToken(token : Text) : async ?Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search companies");
    };
    companies.get(token);
  };

  public shared ({ caller }) func createCompany(profile : CompanyProfile) : async Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create a company");
    };

    // Each user can only own one company
    switch (findCompanyByOwner(caller)) {
      case (?_) { Runtime.trap("You already own a company") };
      case (null) {};
    };

    let id = "GHP_" # profile.taxNumber;

    switch (companies.get(id)) {
      case (?_) { Runtime.trap("A company with this tax number already exists") };
      case (null) {};
    };

    // Check name uniqueness
    for ((_, company) in companies.entries()) {
      if (company.name == profile.name) {
        Runtime.trap("Company name already exists");
      };
    };

    let newCompany : Company = {
      id;
      name = profile.name;
      taxNumber = profile.taxNumber;
      sector = profile.sector;
      address = profile.address;
      phone = profile.phone;
      email = profile.email;
      authorizedPerson = profile.authorizedPerson;
      employeeCount = profile.employeeCount;
      foundingYear = profile.foundingYear;
      owner = caller;
      managers = [];
    };

    companies.add(id, newCompany);
    newCompany;
  };

  public shared ({ caller }) func updateCompany(
    id : CompanyId,
    profile : CompanyProfile,
  ) : async Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update companies");
    };
    let company = getCompanyById(id);
    if (company.owner != caller) {
      Runtime.trap("Unauthorized: Only the company owner can update company data");
    };

    let updatedCompany : Company = {
      id;
      name = profile.name;
      taxNumber = profile.taxNumber;
      sector = profile.sector;
      address = profile.address;
      phone = profile.phone;
      email = profile.email;
      authorizedPerson = profile.authorizedPerson;
      employeeCount = profile.employeeCount;
      foundingYear = profile.foundingYear;
      owner = caller;
      managers = company.managers;
    };

    companies.add(id, updatedCompany);
    updatedCompany;
  };

  // ==========================
  // Role Management Functions
  // ==========================

  public query ({ caller }) func listDefaultRoles() : async [Role] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list roles");
    };
    defaultRoles;
  };

  public query ({ caller }) func listRolesForCompany(companyId : Text) : async [Role] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list roles");
    };
    // Only members of the company or admins can list roles
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: You do not belong to this company");
    };
    defaultRoles;
  };

  public shared ({ caller }) func updateRole(companyId : Text, role : Role) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update roles");
    };
    let company = getCompanyById(companyId);
    // Only company owner can update roles
    if (company.owner != caller) {
      Runtime.trap("Unauthorized: Only the company owner can update roles");
    };
    // Role update logic would persist custom roles here
  };

  // ==========================
  // Staff Management Functions
  // ==========================

  public query ({ caller }) func getStaffForCompany(companyId : CompanyId) : async [Staff] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view staff");
    };
    let company = getCompanyById(companyId);
    // Only owner, managers, or admins can list all staff
    var isManager = false;
    for (mgr in company.managers.vals()) {
      if (mgr == caller) { isManager := true };
    };
    if (company.owner != caller and not isManager and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only company owners or managers can view staff list");
    };

    var result : [Staff] = [];
    for ((_, staff) in staffMembers.entries()) {
      if (staff.companyId == companyId) {
        result := result.concat([staff]);
      };
    };
    result;
  };

  public shared ({ caller }) func addStaffToCompany(companyId : CompanyId, employeeCode : EmployeeCode, roleName : Text) : async RoleAssignmentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add staff");
    };
    let company = getCompanyById(companyId);

    // Only owner or managers can add staff
    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can add staff");
    };

    // Managers can only assign up to administrator/staff roles, not owner
    let callerIsOwner = company.owner == caller;

    // Find staff by employee code
    var targetStaff : ?Staff = null;
    for ((_, staff) in staffMembers.entries()) {
      if (staff.employeeCode == employeeCode) {
        targetStaff := ?staff;
      };
    };

    switch (targetStaff) {
      case (null) { return #invalidCode };
      case (?staff) {
        // Managers cannot assign owner role
        if (not callerIsOwner and roleName == "Company Owner") {
          return #insufficientPermissions;
        };

        if (staff.companyId == companyId) {
          return #alreadyAssigned;
        };

        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = roleNameToCode(roleName);
          companyId = companyId;
          employeeCode = staff.employeeCode;
        };
        staffMembers.add(staff.principal, updatedStaff);
        return #success;
      };
    };
  };

  public shared ({ caller }) func removeStaffFromCompany(companyId : CompanyId, staffPrincipal : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove staff");
    };
    let company = getCompanyById(companyId);

    // Only owner or managers can remove staff
    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can remove staff");
    };

    switch (staffMembers.get(staffPrincipal)) {
      case (null) { return false };
      case (?staff) {
        if (staff.companyId != companyId) { return false };
        // Cannot remove the owner
        if (staffPrincipal == company.owner) {
          Runtime.trap("Cannot remove the company owner");
        };
        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = staff.roleCode;
          companyId = "unassigned";
          employeeCode = staff.employeeCode;
        };
        staffMembers.add(staffPrincipal, updatedStaff);
        return true;
      };
    };
  };

  public shared ({ caller }) func updateStaffRole(companyId : CompanyId, staffPrincipal : Principal, newRoleName : Text) : async RoleAssignmentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update staff roles");
    };
    let company = getCompanyById(companyId);

    // Only owner or managers can update roles
    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can update staff roles");
    };

    let callerIsOwner = company.owner == caller;

    // Managers cannot assign owner role
    if (not callerIsOwner and newRoleName == "Company Owner") {
      return #insufficientPermissions;
    };

    switch (staffMembers.get(staffPrincipal)) {
      case (null) { return #invalidCode };
      case (?staff) {
        if (staff.companyId != companyId) { return #invalidCode };
        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = roleNameToCode(newRoleName);
          companyId = staff.companyId;
          employeeCode = staff.employeeCode;
        };
        staffMembers.add(staffPrincipal, updatedStaff);
        return #success;
      };
    };
  };

  public query ({ caller }) func getMyEmployeeCode() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their employee code");
    };
    switch (staffMembers.get(caller)) {
      case (null) { null };
      case (?staff) { ?staff.employeeCode };
    };
  };

  // ==========================
  // Admin Functions
  // ==========================

  public shared ({ caller }) func adminAssignRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Only admins can assign access control roles
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func adminListAllCompanies() : async [Company] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all companies");
    };
    var result : [Company] = [];
    for ((_, company) in companies.entries()) {
      result := result.concat([company]);
    };
    result;
  };

  // ==========================
  // Utility / Helper Functions
  // ==========================

  func findCompanyByOwner(owner : Principal) : ?Company {
    var result : ?Company = null;
    for ((_, company) in companies.entries()) {
      if (company.owner == owner) {
        result := ?company;
      };
    };
    result;
  };

  func getCompanyById(id : CompanyId) : Company {
    switch (companies.get(id)) {
      case (null) { Runtime.trap("Company not found") };
      case (?company) { company };
    };
  };

  func isCallerOwnerOrManager(caller : Principal, company : Company) : Bool {
    if (company.owner == caller) { return true };
    for (mgr in company.managers.vals()) {
      if (mgr == caller) { return true };
    };
    false;
  };

  func isCallerCompanyMember(caller : Principal, companyId : CompanyId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    switch (companies.get(companyId)) {
      case (null) { return false };
      case (?company) {
        if (company.owner == caller) { return true };
        for (mgr in company.managers.vals()) {
          if (mgr == caller) { return true };
        };
      };
    };
    switch (staffMembers.get(caller)) {
      case (?staff) { staff.companyId == companyId };
      case (null) { false };
    };
  };

  func roleNameToCode(roleName : Text) : Nat {
    if (roleName == "Company Owner") { return 1 };
    if (roleName == "Company Manager") { return 2 };
    if (roleName == "Company Administrator") { return 3 };
    if (roleName == "Company Staff") { return 4 };
    0;
  };

  func generateEmployeeCode(principal : Principal) : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pText = principal.toText();
    var hash : Nat = 0;
    for (c in pText.chars()) {
      hash := (hash * 31 + Nat32.toNat(Char.toNat32(c))) % 2147483647;
    };
    var code = "";
    var h = hash;
    let charsSize = 36;
    let numIterations = 12;
    var i = 0;
    while (i < numIterations) {
      let idx = h % charsSize;
      h := (h / charsSize + h * 7 + 13) % 2147483647;
      var j = 0;
      for (c in chars.chars()) {
        if (j == idx) {
          code := code # Text.fromChar(c);
        };
        j += 1;
      };
      i += 1;
    };
    code;
  };
};
