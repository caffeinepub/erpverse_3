import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


// Specify migration module in with-clause.

actor {
  module ArrayUtils {
    public func contains(array : [Nat], element : Nat) : Bool {
      for (x in array.vals()) {
        if (x == element) { return true };
      };
      false;
    };

    public func containsText(array : [Text], element : Text) : Bool {
      for (x in array.vals()) {
        if (x == element) { return true };
      };
      false;
    };
  };

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

  public type CompanyMembership = {
    companyId : Text;
    roleCode : Nat;
    grantedModules : [Text];
  };

  public type Staff = {
    principal : Principal;
    name : Text;
    projectManager : Text;
    roleCode : Nat;
    companyId : CompanyId;
    employeeCode : EmployeeCode;
    grantedModules : [Text];
    memberships : [CompanyMembership];
  };

  public type UserProfile = {
    name : Text;
    projectManager : Text;
    roleCode : Nat;
    employeeCode : Text;
    companyId : Text;
    memberships : [CompanyMembership];
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

  public type DashboardSummary = {
    totalEmployees : Nat;
    openProjects : Nat;
    lowStockProducts : Nat;
    pendingInvoices : Nat;
    totalCustomers : Nat;
    totalStaff : Nat;
  };

  // ===========================
  // HR Module Types
  // ===========================
  public type EmployeeRecord = {
    id : Text;
    companyId : CompanyId;
    name : Text;
    title : Text;
    department : Text;
    hireDate : Text;
    principal : ?Principal;
  };

  public type LeaveRequest = {
    id : Text;
    companyId : CompanyId;
    employeeId : Text;
    leaveType : Text;
    startDate : Text;
    endDate : Text;
    status : Text;
  };

  public type SalaryInfo = {
    id : Text;
    companyId : CompanyId;
    employeeId : Text;
    baseSalary : Nat;
    currency : Text;
  };

  // ===========================
  // Accounting Module Types
  // ===========================
  public type Transaction = {
    id : Text;
    companyId : CompanyId;
    transactionType : Text; // "income" or "expense"
    amount : Nat;
    category : Text;
    date : Text;
    description : Text;
  };

  public type InvoiceLineItem = {
    description : Text;
    quantity : Nat;
    unitPrice : Nat;
  };

  public type Invoice = {
    id : Text;
    companyId : CompanyId;
    client : Text;
    lineItems : [InvoiceLineItem];
    total : Nat;
    status : Text;
    date : Text;
  };

  public type FinancialSummary = {
    totalIncome : Nat;
    totalExpenses : Nat;
    netBalance : Int;
    invoiceCount : Nat;
    paidInvoiceCount : Nat;
  };

  // ===========================
  // Project Management Types
  // ===========================
  public type Project = {
    id : Text;
    companyId : CompanyId;
    name : Text;
    description : Text;
    status : Text;
    deadline : Text;
    teamMembers : [Principal];
  };

  public type ProjectTask = {
    id : Text;
    companyId : CompanyId;
    projectId : Text;
    title : Text;
    assignee : ?Principal;
    dueDate : Text;
    status : Text;
  };

  // ===========================
  // Inventory Module Types
  // ===========================
  public type Product = {
    id : Text;
    companyId : CompanyId;
    name : Text;
    sku : Text;
    category : Text;
    unitPrice : Nat;
    quantityOnHand : Nat;
  };

  public type StockMovement = {
    id : Text;
    companyId : CompanyId;
    productId : Text;
    movementType : Text; // "in" or "out"
    quantity : Nat;
    date : Text;
    reason : Text;
  };

  // ===========================
  // CRM Module Types
  // ===========================
  public type Customer = {
    id : Text;
    companyId : CompanyId;
    name : Text;
    contactInfo : Text;
    customerCompanyName : Text;
  };

  public type SalesOpportunity = {
    id : Text;
    companyId : CompanyId;
    customerId : Text;
    estimatedValue : Nat;
    stage : Text;
    closeDate : Text;
  };

  public type CommunicationLog = {
    id : Text;
    companyId : CompanyId;
    customerId : Text;
    date : Text;
    note : Text;
    logType : Text;
  };

  // ===========================
  // Persistent State
  // ===========================
  let companies = Map.empty<CompanyId, Company>();
  let staffMembers = Map.empty<Principal, Staff>();
  let companyRoles = Map.empty<CompanyId, [Role]>();

  // HR state
  let hrEmployees = Map.empty<Text, EmployeeRecord>();
  let hrLeaveRequests = Map.empty<Text, LeaveRequest>();
  let hrSalaries = Map.empty<Text, SalaryInfo>();
  // Accounting state
  let accountingTransactions = Map.empty<Text, Transaction>();
  let accountingInvoices = Map.empty<Text, Invoice>();
  // Project Management state
  let projects = Map.empty<Text, Project>();
  let projectTasks = Map.empty<Text, ProjectTask>();
  // Inventory state
  let inventoryProducts = Map.empty<Text, Product>();
  let stockMovements = Map.empty<Text, StockMovement>();
  // CRM state
  let crmCustomers = Map.empty<Text, Customer>();
  let salesOpportunities = Map.empty<Text, SalesOpportunity>();
  let communicationLogs = Map.empty<Text, CommunicationLog>();
  var idCounter : Nat = 0;

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

  // ===========================
  // Internal Helpers
  // ===========================
  func nextId() : Text {
    idCounter += 1;
    idCounter.toText();
  };

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
    switch (staffMembers.get(caller)) {
      case (?staff) {
        for (membership in staff.memberships.vals()) {
          if (membership.companyId == company.id and membership.roleCode == 2) {
            return true;
          };
        };
      };
      case (null) {};
    };
    false;
  };

  func isCallerCompanyMember(caller : Principal, companyId : CompanyId) : Bool {
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
      case (?staff) {
        for (membership in staff.memberships.vals()) {
          if (membership.companyId == companyId) { return true };
        };
      };
      case (null) {};
    };
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    false;
  };

  func getCallerCompanyRole(caller : Principal, companyId : CompanyId) : RoleType {
    switch (companies.get(companyId)) {
      case (null) { return #companyStaff };
      case (?company) {
        if (company.owner == caller) {
          return #companyOwner;
        };
        for (mgr in company.managers.vals()) {
          if (mgr == caller) { return #companyManager(#administrative) };
        };
      };
    };
    switch (staffMembers.get(caller)) {
      case (null) { #companyStaff };
      case (?staff) {
        for (membership in staff.memberships.vals()) {
          if (membership.companyId == companyId) {
            switch (membership.roleCode) {
              case (1) { return #companyOwner };
              case (2) { return #companyManager(#administrative) };
              case (3) { return #companyAdministrator(#administrative) };
              case (4) { return #companyStaff };
              case (_) {};
            };
          };
        };
        #companyStaff;
      };
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
      hash := (hash * 31 + c.toNat32().toNat()) % 2147483647;
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

  func callerHasModuleAccess(caller : Principal, companyId : CompanyId, moduleName : Text) : Bool {
    let role = getCallerCompanyRole(caller, companyId);
    switch (role) {
      case (#companyOwner) { return true };
      case (#companyManager _) { return true };
      case (#companyAdministrator _) {
        switch (staffMembers.get(caller)) {
          case (?staff) {
            for (membership in staff.memberships.vals()) {
              if (membership.companyId == companyId) {
                return ArrayUtils.containsText(membership.grantedModules, moduleName);
              };
            };
          };
          case (null) {};
        };
        return false;
      };
      case (#companyStaff) {
        if (AccessControl.isAdmin(accessControlState, caller)) { return true };
        switch (staffMembers.get(caller)) {
          case (?staff) {
            for (membership in staff.memberships.vals()) {
              if (membership.companyId == companyId) {
                return ArrayUtils.containsText(membership.grantedModules, moduleName);
              };
            };
          };
          case (null) {};
        };
        return false;
      };
    };
  };

  func isCallerOwnerOrManagerForCompany(caller : Principal, companyId : CompanyId) : Bool {
    let role = getCallerCompanyRole(caller, companyId);
    switch (role) {
      case (#companyOwner) { true };
      case (#companyManager _) { true };
      case (_) { false };
    };
  };

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
          memberships = staff.memberships;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
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
          memberships = staff.memberships;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let (employeeCode, companyId, grantedModules, memberships) = switch (staffMembers.get(caller)) {
      case (null) {
        let code = generateEmployeeCode(caller);
        (code, "unassigned", [], []);
      };
      case (?existing) {
        (existing.employeeCode, existing.companyId, existing.grantedModules, existing.memberships);
      };
    };
    let staff : Staff = {
      principal = caller;
      name = profile.name;
      projectManager = profile.projectManager;
      roleCode = profile.roleCode;
      companyId = companyId;
      employeeCode = employeeCode;
      grantedModules = grantedModules;
      memberships = memberships;
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
    isCallerCompanyMember(caller, companyId);
  };

  public query ({ caller }) func getCompany(companyId : Text) : async ?Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view company details");
    };
    switch (companies.get(companyId)) {
      case (null) { null };
      case (?company) {
        if (not isCallerCompanyMember(caller, companyId)) {
          Runtime.trap("Unauthorized: You do not belong to this company");
        };
        ?company;
      };
    };
  };

  public query ({ caller }) func findByOwner(owner : Principal) : async ?Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search companies");
    };
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

    switch (findCompanyByOwner(caller)) {
      case (?_) { Runtime.trap("You already own a company") };
      case (null) {};
    };

    let id = "GHP_" # profile.taxNumber;

    switch (companies.get(id)) {
      case (?_) { Runtime.trap("A company with this tax number already exists") };
      case (null) {};
    };

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
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: You do not belong to this company");
    };
    // Merge default and custom roles for the company
    let customRoles = switch (companyRoles.get(companyId)) {
      case (?roles) { roles };
      case (null) { [] };
    };
    defaultRoles.concat(customRoles);
  };

  public shared ({ caller }) func addCustomRole(companyId : Text, role : Role) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add roles");
    };
    let company = getCompanyById(companyId);
    if (not isCallerOwnerOrManagerForCompany(caller, companyId)) {
      Runtime.trap("Unauthorized: Only company owners or managers can add roles");
    };
    let roles = switch (companyRoles.get(companyId)) {
      case (?r) { r };
      case (null) { [] };
    };
    companyRoles.add(companyId, roles.concat([role]));
  };

  public shared ({ caller }) func removeCustomRole(companyId : Text, roleName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove roles");
    };
    let company = getCompanyById(companyId);
    if (not isCallerOwnerOrManagerForCompany(caller, companyId)) {
      Runtime.trap("Unauthorized: Only company owners or managers can remove roles");
    };
    let roles = switch (companyRoles.get(companyId)) {
      case (?r) { r };
      case (null) { [] };
    };
    let filteredRoles = roles.filter(func(role) { role.name != roleName });
    companyRoles.add(companyId, filteredRoles);
  };

  // ==========================
  // Module Access Management
  // ==========================
  public shared ({ caller }) func grantModuleAccess(companyId : CompanyId, staffPrincipal : Principal, moduleName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can grant module access");
    };
    let company = getCompanyById(companyId);
    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can grant module access");
    };
    switch (staffMembers.get(staffPrincipal)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?staff) {
        var foundMembership = false;
        let updatedMemberships = staff.memberships.map(
          func(m) {
            if (m.companyId == companyId) {
              foundMembership := true;
              if (ArrayUtils.containsText(m.grantedModules, moduleName)) {
                return m;
              };
              {
                companyId = m.companyId;
                roleCode = m.roleCode;
                grantedModules = m.grantedModules.concat([moduleName]);
              };
            } else {
              m;
            };
          }
        );
        if (not foundMembership) {
          Runtime.trap("Staff member does not belong to this company");
        };
        let primaryMembership = updatedMemberships.find(func(m) { m.companyId == companyId });
        let (newCompanyId, newRoleCode, newGrantedModules) = switch (primaryMembership) {
          case (?m) { (m.companyId, m.roleCode, m.grantedModules) };
          case (null) { (staff.companyId, staff.roleCode, staff.grantedModules) };
        };
        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = newRoleCode;
          companyId = newCompanyId;
          employeeCode = staff.employeeCode;
          grantedModules = newGrantedModules;
          memberships = updatedMemberships;
        };
        staffMembers.add(staffPrincipal, updatedStaff);
      };
    };
  };

  public shared ({ caller }) func revokeModuleAccess(companyId : CompanyId, staffPrincipal : Principal, moduleName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can revoke module access");
    };
    let company = getCompanyById(companyId);
    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can revoke module access");
    };
    switch (staffMembers.get(staffPrincipal)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?staff) {
        var foundMembership = false;
        let updatedMemberships = staff.memberships.map(
          func(m) {
            if (m.companyId == companyId) {
              foundMembership := true;
              {
                companyId = m.companyId;
                roleCode = m.roleCode;
                grantedModules = m.grantedModules.filter(func(mod : Text) : Bool { mod != moduleName });
              };
            } else {
              m;
            };
          }
        );
        if (not foundMembership) {
          Runtime.trap("Staff member does not belong to this company");
        };
        let primaryMembership = updatedMemberships.find(func(m) { m.companyId == companyId });
        let (newCompanyId, newRoleCode, newGrantedModules) = switch (primaryMembership) {
          case (?m) { (m.companyId, m.roleCode, m.grantedModules) };
          case (null) { (staff.companyId, staff.roleCode, staff.grantedModules) };
        };
        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = newRoleCode;
          companyId = newCompanyId;
          employeeCode = staff.employeeCode;
          grantedModules = newGrantedModules;
          memberships = updatedMemberships;
        };
        staffMembers.add(staffPrincipal, updatedStaff);
      };
    };
  };

  public query ({ caller }) func getGrantedModules(companyId : CompanyId, staffPrincipal : Principal) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view module access");
    };
    let company = getCompanyById(companyId);
    if (caller != staffPrincipal and not isCallerOwnerOrManager(caller, company) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view another staff member's module access");
    };
    switch (staffMembers.get(staffPrincipal)) {
      case (null) { [] };
      case (?staff) {
        for (membership in staff.memberships.vals()) {
          if (membership.companyId == companyId) {
            return membership.grantedModules;
          };
        };
        [];
      };
    };
  };

  // ==========================
  // Staff Management Functions
  // ==========================
  public query ({ caller }) func getStaffForCompany(companyId : CompanyId) : async [Staff] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view staff");
    };

    let company = getCompanyById(companyId);

    let callerRole = getCallerCompanyRole(caller, companyId);

    let authorizedRoleCodes : [Nat] = switch (callerRole) {
      case (#companyOwner) { [1, 2, 3, 4] };
      case (#companyManager _) { [3, 4] };
      case (#companyAdministrator _) {
        Runtime.trap("Unauthorized: Only company owners or managers can view staff list");
      };
      case (#companyStaff) {
        if (AccessControl.isAdmin(accessControlState, caller)) {
          [1, 2, 3, 4];
        } else {
          Runtime.trap("Unauthorized: Only company owners or managers can view staff list");
        };
      };
    };

    var result : [Staff] = [];
    for ((_, staff) in staffMembers.entries()) {
      for (membership in staff.memberships.vals()) {
        if (membership.companyId == companyId and ArrayUtils.contains(authorizedRoleCodes, membership.roleCode)) {
          result := result.concat([staff]);
        };
      };
    };
    result;
  };

  public shared ({ caller }) func addStaffToCompany(companyId : CompanyId, employeeCode : EmployeeCode, roleName : Text) : async RoleAssignmentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add staff");
    };
    let company = getCompanyById(companyId);

    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can add staff");
    };

    let callerIsOwner = company.owner == caller;

    var targetStaff : ?Staff = null;
    for ((_, staff) in staffMembers.entries()) {
      if (staff.employeeCode == employeeCode) {
        targetStaff := ?staff;
      };
    };

    switch (targetStaff) {
      case (null) { return #invalidCode };
      case (?staff) {
        if (not callerIsOwner and roleName == "Company Owner") {
          return #insufficientPermissions;
        };

        for (membership in staff.memberships.vals()) {
          if (membership.companyId == companyId) {
            return #alreadyAssigned;
          };
        };

        let newRoleCode = roleNameToCode(roleName);
        let newMembership : CompanyMembership = {
          companyId = companyId;
          roleCode = newRoleCode;
          grantedModules = [];
        };

        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = newRoleCode;
          companyId = companyId;
          employeeCode = staff.employeeCode;
          grantedModules = [];
          memberships = staff.memberships.concat([newMembership]);
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

    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can remove staff");
    };

    switch (staffMembers.get(staffPrincipal)) {
      case (null) { return false };
      case (?staff) {
        if (staffPrincipal == company.owner) {
          Runtime.trap("Cannot remove the company owner");
        };

        var foundMembership = false;
        for (membership in staff.memberships.vals()) {
          if (membership.companyId == companyId) {
            foundMembership := true;
          };
        };

        if (not foundMembership) { return false };

        let updatedMemberships = staff.memberships.filter(func(m) { m.companyId != companyId });

        let (newCompanyId, newRoleCode, newGrantedModules) = if (updatedMemberships.size() > 0) {
          (updatedMemberships[0].companyId, updatedMemberships[0].roleCode, updatedMemberships[0].grantedModules);
        } else {
          ("unassigned", 4, []);
        };

        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = newRoleCode;
          companyId = newCompanyId;
          employeeCode = staff.employeeCode;
          grantedModules = newGrantedModules;
          memberships = updatedMemberships;
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

    if (not isCallerOwnerOrManager(caller, company)) {
      Runtime.trap("Unauthorized: Only company owners or managers can update staff roles");
    };

    let callerIsOwner = company.owner == caller;

    if (not callerIsOwner and newRoleName == "Company Owner") {
      return #insufficientPermissions;
    };

    switch (staffMembers.get(staffPrincipal)) {
      case (null) { return #invalidCode };
      case (?staff) {
        var foundMembership = false;
        let newRoleCode = roleNameToCode(newRoleName);

        let updatedMemberships = staff.memberships.map(
          func(m) {
            if (m.companyId == companyId) {
              foundMembership := true;
              {
                companyId = m.companyId;
                roleCode = newRoleCode;
                grantedModules = m.grantedModules;
              };
            } else {
              m;
            };
          }
        );

        if (not foundMembership) { return #invalidCode };

        let primaryMembership = updatedMemberships.find(func(m) { m.companyId == companyId });
        let (newCompanyId, newGrantedModules) = switch (primaryMembership) {
          case (?m) { (m.companyId, m.grantedModules) };
          case (null) { (staff.companyId, staff.grantedModules) };
        };

        let updatedStaff : Staff = {
          principal = staff.principal;
          name = staff.name;
          projectManager = staff.projectManager;
          roleCode = newRoleCode;
          companyId = newCompanyId;
          employeeCode = staff.employeeCode;
          grantedModules = newGrantedModules;
          memberships = updatedMemberships;
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

  public query ({ caller }) func getStaffName(principal : Principal) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get staff names");
    };
    switch (staffMembers.get(principal)) {
      case (null) { null };
      case (?staff) { ?staff.name };
    };
  };

  /// ==========================
  /// HR Module
  /// ==========================
  public shared ({ caller }) func addEmployee(companyId : CompanyId, employee : EmployeeRecord) : async EmployeeRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "HR")) {
      Runtime.trap("Unauthorized: No access to HR module");
    };

    let newId = nextId();
    let newEmployee : EmployeeRecord = {
      id = newId;
      companyId = companyId;
      name = employee.name;
      title = employee.title;
      department = employee.department;
      hireDate = employee.hireDate;
      principal = employee.principal;
    };

    hrEmployees.add(newId, newEmployee);
    newEmployee;
  };

  public shared ({ caller }) func updateEmployee(companyId : CompanyId, updatedEmployee : EmployeeRecord) : async EmployeeRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "HR")) {
      Runtime.trap("Unauthorized: No access to HR module");
    };

    hrEmployees.add(updatedEmployee.id, updatedEmployee);
    updatedEmployee;
  };

  public shared ({ caller }) func removeEmployee(companyId : CompanyId, employeeId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "HR")) {
      Runtime.trap("Unauthorized: No access to HR module");
    };
    hrEmployees.remove(employeeId);
    true;
  };

  public shared ({ caller }) func addLeaveRequest(companyId : CompanyId, request : LeaveRequest) : async LeaveRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "HR")) {
      Runtime.trap("Unauthorized: No access to HR module");
    };

    let newId = nextId();
    let newRequest : LeaveRequest = {
      id = newId;
      companyId = companyId;
      employeeId = request.employeeId;
      leaveType = request.leaveType;
      startDate = request.startDate;
      endDate = request.endDate;
      status = request.status;
    };

    hrLeaveRequests.add(newId, newRequest);
    newRequest;
  };

  public shared ({ caller }) func updateLeaveRequest(companyId : CompanyId, updatedRequest : LeaveRequest) : async LeaveRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "HR")) {
      Runtime.trap("Unauthorized: No access to HR module");
    };

    hrLeaveRequests.add(updatedRequest.id, updatedRequest);
    updatedRequest;
  };

  public shared ({ caller }) func addSalaryInfo(companyId : CompanyId, salary : SalaryInfo) : async SalaryInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "HR")) {
      Runtime.trap("Unauthorized: No access to HR module");
    };

    let newId = nextId();
    let newSalary : SalaryInfo = {
      id = newId;
      companyId = companyId;
      employeeId = salary.employeeId;
      baseSalary = salary.baseSalary;
      currency = salary.currency;
    };

    hrSalaries.add(newId, newSalary);
    newSalary;
  };

  public query ({ caller }) func getHRData(companyId : CompanyId) : async {
    employees : [EmployeeRecord];
    leaveRequests : [LeaveRequest];
    salaries : [SalaryInfo];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "HR")) {
      Runtime.trap("Unauthorized: No access to HR module");
    };

    let employeeList = hrEmployees.values().toArray().filter(
      func(e) { e.companyId == companyId }
    );
    let leaveRequestList = hrLeaveRequests.values().toArray().filter(
      func(l) { l.companyId == companyId }
    );
    let salaryList = hrSalaries.values().toArray().filter(
      func(s) { s.companyId == companyId }
    );

    {
      employees = employeeList;
      leaveRequests = leaveRequestList;
      salaries = salaryList;
    };
  };

  /// ==========================
  /// Accounting Module
  /// ==========================
  public shared ({ caller }) func addTransaction(companyId : CompanyId, tx : Transaction) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Accounting")) {
      Runtime.trap("Unauthorized: No access to Accounting module");
    };

    let newId = nextId();
    let newTx : Transaction = {
      id = newId;
      companyId = companyId;
      transactionType = tx.transactionType;
      amount = tx.amount;
      category = tx.category;
      date = tx.date;
      description = tx.description;
    };

    accountingTransactions.add(newId, newTx);
    newTx;
  };

  public shared ({ caller }) func updateTransaction(companyId : CompanyId, updatedTx : Transaction) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Accounting")) {
      Runtime.trap("Unauthorized: No access to Accounting module");
    };

    accountingTransactions.add(updatedTx.id, updatedTx);
    updatedTx;
  };

  public shared ({ caller }) func removeTransaction(companyId : CompanyId, txId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Accounting")) {
      Runtime.trap("Unauthorized: No access to Accounting module");
    };
    accountingTransactions.remove(txId);
    true;
  };

  public shared ({ caller }) func addInvoice(companyId : CompanyId, invoice : Invoice) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Accounting")) {
      Runtime.trap("Unauthorized: No access to Accounting module");
    };

    let newId = nextId();
    let newInvoice : Invoice = {
      id = newId;
      companyId = companyId;
      client = invoice.client;
      lineItems = invoice.lineItems;
      total = invoice.total;
      status = invoice.status;
      date = invoice.date;
    };

    accountingInvoices.add(newId, newInvoice);
    newInvoice;
  };

  public shared ({ caller }) func updateInvoice(companyId : CompanyId, updatedInvoice : Invoice) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Accounting")) {
      Runtime.trap("Unauthorized: No access to Accounting module");
    };

    accountingInvoices.add(updatedInvoice.id, updatedInvoice);
    updatedInvoice;
  };

  public query ({ caller }) func getAccountingData(companyId : CompanyId) : async {
    transactions : [Transaction];
    invoices : [Invoice];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Accounting")) {
      Runtime.trap("Unauthorized: No access to Accounting module");
    };

    let txList = accountingTransactions.values().toArray().filter(
      func(t) { t.companyId == companyId }
    );
    let invoiceList = accountingInvoices.values().toArray().filter(
      func(i) { i.companyId == companyId }
    );

    {
      transactions = txList;
      invoices = invoiceList;
    };
  };

  public query ({ caller }) func getFinancialSummary(companyId : CompanyId) : async FinancialSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Accounting")) {
      Runtime.trap("Unauthorized: No access to Accounting module");
    };

    var totalIncome : Nat = 0;
    var totalExpenses : Nat = 0;
    var invoiceCount : Nat = 0;
    var paidInvoiceCount : Nat = 0;

    for ((_, tx) in accountingTransactions.entries()) {
      if (tx.companyId == companyId) {
        if (tx.transactionType == "income") {
          totalIncome += tx.amount;
        } else if (tx.transactionType == "expense") {
          totalExpenses += tx.amount;
        };
      };
    };

    for ((_, invoice) in accountingInvoices.entries()) {
      if (invoice.companyId == companyId) {
        invoiceCount += 1;
        if (invoice.status == "paid") {
          paidInvoiceCount += 1;
        };
      };
    };

    let netBalance : Int = totalIncome - totalExpenses;

    {
      totalIncome = totalIncome;
      totalExpenses = totalExpenses;
      netBalance = netBalance;
      invoiceCount = invoiceCount;
      paidInvoiceCount = paidInvoiceCount;
    };
  };

  /// ==========================
  /// Project Management Module
  /// ==========================
  public shared ({ caller }) func createProject(companyId : CompanyId, project : Project) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Projects")) {
      Runtime.trap("Unauthorized: No access to Projects module");
    };

    let newId = nextId();
    let newProject : Project = {
      id = newId;
      companyId = companyId;
      name = project.name;
      description = project.description;
      status = project.status;
      deadline = project.deadline;
      teamMembers = project.teamMembers;
    };

    projects.add(newId, newProject);
    newProject;
  };

  public shared ({ caller }) func updateProject(companyId : CompanyId, updatedProject : Project) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Projects")) {
      Runtime.trap("Unauthorized: No access to Projects module");
    };

    projects.add(updatedProject.id, updatedProject);
    updatedProject;
  };

  public shared ({ caller }) func removeProject(companyId : CompanyId, projectId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Projects")) {
      Runtime.trap("Unauthorized: No access to Projects module");
    };
    projects.remove(projectId);
    true;
  };

  public shared ({ caller }) func createProjectTask(companyId : CompanyId, task : ProjectTask) : async ProjectTask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Projects")) {
      Runtime.trap("Unauthorized: No access to Projects module");
    };

    let newId = nextId();
    let newTask : ProjectTask = {
      id = newId;
      companyId = companyId;
      projectId = task.projectId;
      title = task.title;
      assignee = task.assignee;
      dueDate = task.dueDate;
      status = task.status;
    };

    projectTasks.add(newId, newTask);
    newTask;
  };

  public shared ({ caller }) func updateProjectTask(companyId : CompanyId, updatedTask : ProjectTask) : async ProjectTask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Projects")) {
      Runtime.trap("Unauthorized: No access to Projects module");
    };

    projectTasks.add(updatedTask.id, updatedTask);
    updatedTask;
  };

  public shared ({ caller }) func removeProjectTask(companyId : CompanyId, taskId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Projects")) {
      Runtime.trap("Unauthorized: No access to Projects module");
    };
    projectTasks.remove(taskId);
    true;
  };

  public query ({ caller }) func getProjectData(companyId : CompanyId) : async {
    projects : [Project];
    tasks : [ProjectTask];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Projects")) {
      Runtime.trap("Unauthorized: No access to Projects module");
    };

    let projectList = projects.values().toArray().filter(
      func(p) { p.companyId == companyId }
    );
    let taskList = projectTasks.values().toArray().filter(
      func(t) { t.companyId == companyId }
    );

    {
      projects = projectList;
      tasks = taskList;
    };
  };

  /// ==========================
  /// Inventory Module
  /// ==========================
  public shared ({ caller }) func addProduct(companyId : CompanyId, product : Product) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Inventory")) {
      Runtime.trap("Unauthorized: No access to Inventory module");
    };

    let newId = nextId();
    let newProduct : Product = {
      id = newId;
      companyId = companyId;
      name = product.name;
      sku = product.sku;
      category = product.category;
      unitPrice = product.unitPrice;
      quantityOnHand = product.quantityOnHand;
    };

    inventoryProducts.add(newId, newProduct);
    newProduct;
  };

  public shared ({ caller }) func updateProduct(companyId : CompanyId, updatedProduct : Product) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Inventory")) {
      Runtime.trap("Unauthorized: No access to Inventory module");
    };

    inventoryProducts.add(updatedProduct.id, updatedProduct);
    updatedProduct;
  };

  public shared ({ caller }) func removeProduct(companyId : CompanyId, productId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Inventory")) {
      Runtime.trap("Unauthorized: No access to Inventory module");
    };
    inventoryProducts.remove(productId);
    true;
  };

  public shared ({ caller }) func addStockMovement(companyId : CompanyId, movement : StockMovement) : async StockMovement {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Inventory")) {
      Runtime.trap("Unauthorized: No access to Inventory module");
    };

    let newId = nextId();
    let newMovement : StockMovement = {
      id = newId;
      companyId = companyId;
      productId = movement.productId;
      movementType = movement.movementType;
      quantity = movement.quantity;
      date = movement.date;
      reason = movement.reason;
    };

    stockMovements.add(newId, newMovement);
    newMovement;
  };

  public query ({ caller }) func getInventoryData(companyId : CompanyId) : async {
    products : [Product];
    movements : [StockMovement];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "Inventory")) {
      Runtime.trap("Unauthorized: No access to Inventory module");
    };

    let productList = inventoryProducts.values().toArray().filter(
      func(p) { p.companyId == companyId }
    );
    let movementList = stockMovements.values().toArray().filter(
      func(m) { m.companyId == companyId }
    );

    {
      products = productList;
      movements = movementList;
    };
  };

  /// ==========================
  /// CRM Module
  /// ==========================
  public shared ({ caller }) func addCustomer(companyId : CompanyId, customer : Customer) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "CRM")) {
      Runtime.trap("Unauthorized: No access to CRM module");
    };

    let newId = nextId();
    let newCustomer : Customer = {
      id = newId;
      companyId = companyId;
      name = customer.name;
      contactInfo = customer.contactInfo;
      customerCompanyName = customer.customerCompanyName;
    };

    crmCustomers.add(newId, newCustomer);
    newCustomer;
  };

  public shared ({ caller }) func updateCustomer(companyId : CompanyId, updatedCustomer : Customer) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "CRM")) {
      Runtime.trap("Unauthorized: No access to CRM module");
    };

    crmCustomers.add(updatedCustomer.id, updatedCustomer);
    updatedCustomer;
  };

  public shared ({ caller }) func removeCustomer(companyId : CompanyId, customerId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "CRM")) {
      Runtime.trap("Unauthorized: No access to CRM module");
    };
    crmCustomers.remove(customerId);
    true;
  };

  public shared ({ caller }) func addSalesOpportunity(companyId : CompanyId, opportunity : SalesOpportunity) : async SalesOpportunity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "CRM")) {
      Runtime.trap("Unauthorized: No access to CRM module");
    };

    let newId = nextId();
    let newOpportunity : SalesOpportunity = {
      id = newId;
      companyId = companyId;
      customerId = opportunity.customerId;
      estimatedValue = opportunity.estimatedValue;
      stage = opportunity.stage;
      closeDate = opportunity.closeDate;
    };

    salesOpportunities.add(newId, newOpportunity);
    newOpportunity;
  };

  public shared ({ caller }) func updateSalesOpportunity(companyId : CompanyId, updatedOpportunity : SalesOpportunity) : async SalesOpportunity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "CRM")) {
      Runtime.trap("Unauthorized: No access to CRM module");
    };

    salesOpportunities.add(updatedOpportunity.id, updatedOpportunity);
    updatedOpportunity;
  };

  public shared ({ caller }) func addCommunicationLog(companyId : CompanyId, log : CommunicationLog) : async CommunicationLog {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "CRM")) {
      Runtime.trap("Unauthorized: No access to CRM module");
    };

    let newId = nextId();
    let newLog : CommunicationLog = {
      id = newId;
      companyId = companyId;
      customerId = log.customerId;
      date = log.date;
      note = log.note;
      logType = log.logType;
    };

    communicationLogs.add(newId, newLog);
    newLog;
  };

  public query ({ caller }) func getCRMData(companyId : CompanyId) : async {
    customers : [Customer];
    opportunities : [SalesOpportunity];
    logs : [CommunicationLog];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };
    if (not callerHasModuleAccess(caller, companyId, "CRM")) {
      Runtime.trap("Unauthorized: No access to CRM module");
    };

    let customerList = crmCustomers.values().toArray().filter(
      func(c) { c.companyId == companyId }
    );
    let opportunityList = salesOpportunities.values().toArray().filter(
      func(o) { o.companyId == companyId }
    );
    let logList = communicationLogs.values().toArray().filter(
      func(l) { l.companyId == companyId }
    );

    {
      customers = customerList;
      opportunities = opportunityList;
      logs = logList;
    };
  };

  /// ==========================
  /// Dashboard Summary
  /// ==========================
  public query ({ caller }) func getDashboardSummary(companyId : CompanyId) : async DashboardSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Permission denied");
    };
    if (not isCallerCompanyMember(caller, companyId)) {
      Runtime.trap("Unauthorized: Not a member of this company");
    };

    var totalEmployees : Nat = 0;
    var openProjects : Nat = 0;
    var lowStockProducts : Nat = 0;
    var pendingInvoices : Nat = 0;
    var totalCustomers : Nat = 0;
    var totalStaff : Nat = 0;

    for ((_, emp) in hrEmployees.entries()) {
      if (emp.companyId == companyId) {
        totalEmployees += 1;
      };
    };

    for ((_, proj) in projects.entries()) {
      if (proj.companyId == companyId and proj.status == "open") {
        openProjects += 1;
      };
    };

    for ((_, prod) in inventoryProducts.entries()) {
      if (prod.companyId == companyId and prod.quantityOnHand < 10) {
        lowStockProducts += 1;
      };
    };

    for ((_, inv) in accountingInvoices.entries()) {
      if (inv.companyId == companyId and inv.status == "pending") {
        pendingInvoices += 1;
      };
    };

    for ((_, cust) in crmCustomers.entries()) {
      if (cust.companyId == companyId) {
        totalCustomers += 1;
      };
    };

    for ((_, staff) in staffMembers.entries()) {
      for (membership in staff.memberships.vals()) {
        if (membership.companyId == companyId) {
          totalStaff += 1;
        };
      };
    };

    {
      totalEmployees = totalEmployees;
      openProjects = openProjects;
      lowStockProducts = lowStockProducts;
      pendingInvoices = pendingInvoices;
      totalCustomers = totalCustomers;
      totalStaff = totalStaff;
    };
  };
};
