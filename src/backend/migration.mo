import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type CompanyId = Text;
  type EmployeeCode = Text;

  type PhoneNumber = {
    countryCode : Text;
    number : Text;
  };

  type Company = {
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

  type CompanyMembership = {
    companyId : Text;
    roleCode : Nat;
    grantedModules : [Text];
  };

  type OldStaff = {
    principal : Principal;
    name : Text;
    projectManager : Text;
    roleCode : Nat;
    companyId : CompanyId;
    employeeCode : EmployeeCode;
    grantedModules : [Text];
  };

  type NewStaff = {
    principal : Principal;
    name : Text;
    projectManager : Text;
    roleCode : Nat;
    companyId : CompanyId;
    employeeCode : EmployeeCode;
    grantedModules : [Text];
    memberships : [CompanyMembership];
  };

  type OldActor = {
    companies : Map.Map<CompanyId, Company>;
    staffMembers : Map.Map<Principal, OldStaff>;
    var idCounter : Nat;
  };

  type NewActor = {
    companies : Map.Map<CompanyId, Company>;
    staffMembers : Map.Map<Principal, NewStaff>;
    var idCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newStaff = old.staffMembers.map<Principal, OldStaff, NewStaff>(
      func(_p, oldStaff) {
        {
          oldStaff with
          memberships = [{
            companyId = oldStaff.companyId;
            roleCode = oldStaff.roleCode;
            grantedModules = oldStaff.grantedModules;
          }]
        };
      }
    );
    {
      companies = old.companies;
      staffMembers = newStaff;
      var idCounter = old.idCounter;
    };
  };
};
