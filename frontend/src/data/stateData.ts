export interface StateInfo {
  name: string;
  slug: string;
  description: string;
  securityDepositLimit: string;
  securityDepositReturn: string;
  rentIncreaseNotice: string;
  entryNotice: string;
  keyStatutes: string[];
  commonIssues: string[];
  resources: Array<{
    title: string;
    url: string;
  }>;
}

export const stateData: Record<string, StateInfo> = {
  california: {
    name: "California",
    slug: "california",
    description: "California has some of the most comprehensive tenant protection laws in the United States. With strict security deposit limits, rent control provisions, and detailed notice requirements, landlords and tenants must stay informed to remain compliant.",
    securityDepositLimit: "1 month's rent for unfurnished units (as of July 2024, per AB 12). Previously 2 months for unfurnished, 3 months for furnished.",
    securityDepositReturn: "21 days after tenant moves out. Must include itemized statement of any deductions.",
    rentIncreaseNotice: "30 days for increases under 10%, 90 days for 10% or more. Annual increases capped at 5% + local CPI (max 10%) under AB 1482 for properties 15+ years old.",
    entryNotice: "24 hours written notice required, except in emergencies.",
    keyStatutes: [
      "California Civil Code §1950.5 - Security Deposits",
      "California Civil Code §1954 - Entry and Inspection",
      "AB 1482 - Tenant Protection Act (rent caps)",
      "AB 12 - Security Deposit Limit Reduction (2024)"
    ],
    commonIssues: [
      "Landlords charging deposits above the legal limit",
      "Failure to return deposits within 21 days with itemization",
      "Improper entry without adequate notice",
      "Rent increases exceeding AB 1482 caps",
      "Missing required disclosures (lead paint, mold, etc.)"
    ],
    resources: [
      {
        title: "California Department of Consumer Affairs - Tenant Rights",
        url: "https://www.dca.ca.gov/publications/landlordbook/catenant.pdf"
      },
      {
        title: "California Courts - Housing Resources",
        url: "https://www.courts.ca.gov/selfhelp-housing.htm"
      }
    ]
  },
  texas: {
    name: "Texas",
    slug: "texas",
    description: "Texas landlord-tenant law is generally more landlord-friendly compared to other states. While there are fewer statewide tenant protections, landlords must still comply with specific requirements regarding security deposits, property maintenance, and eviction procedures.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after tenant moves out. Must include itemized list of deductions if any portion is withheld.",
    rentIncreaseNotice: "No statutory notice requirement for month-to-month tenancies, unless specified in lease. Check local ordinances in cities like Austin.",
    entryNotice: "No statutory requirement, but lease should specify reasonable notice provisions.",
    keyStatutes: [
      "Texas Property Code §92.101-109 - Security Deposits",
      "Texas Property Code §92.052 - Landlord's Duty to Repair",
      "Texas Property Code §92.019 - Retaliation by Landlord",
      "Texas Property Code Chapter 24 - Eviction Process"
    ],
    commonIssues: [
      "Landlords failing to return deposits within 30 days",
      "Not providing itemized deduction statements",
      "Improper eviction procedures (self-help evictions)",
      "Retaliation against tenants who request repairs",
      "Failure to maintain habitability standards"
    ],
    resources: [
      {
        title: "Texas State Law Library - Landlord-Tenant Law",
        url: "https://guides.sll.texas.gov/landlord-tenant"
      },
      {
        title: "Texas Attorney General - Tenant Rights",
        url: "https://www.texasattorneygeneral.gov/consumer-protection/residential-landlord-tenant-issues"
      }
    ]
  },
  florida: {
    name: "Florida",
    slug: "florida",
    description: "Florida's landlord-tenant laws balance the interests of both parties while providing clear guidelines for security deposits, property maintenance, and eviction procedures. The state requires specific notice periods and deposit handling procedures.",
    securityDepositLimit: "No statutory limit, but deposits must be reasonable and disclosed in the lease.",
    securityDepositReturn: "15 days if not making deductions, 30 days if making deductions with itemized notice sent to tenant within 30 days.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, typically 30-60 days is considered reasonable. Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required, typically 12 hours is considered acceptable unless emergency.",
    keyStatutes: [
      "Florida Statutes §83.49 - Security Deposits",
      "Florida Statutes §83.51 - Landlord's Obligation to Maintain Premises",
      "Florida Statutes §83.53 - Landlord's Access to Dwelling Unit",
      "Florida Statutes §83.56 - Termination of Tenancy"
    ],
    commonIssues: [
      "Improper security deposit handling (not holding in separate account)",
      "Failure to provide proper notice of deposit deductions",
      "Landlord self-help evictions (illegal in Florida)",
      "Not maintaining property to habitability standards",
      "Improper lease termination procedures"
    ],
    resources: [
      {
        title: "The Florida Bar - Consumer Pamphlet on Landlord/Tenant Law",
        url: "https://www.floridabar.org/public/consumer/tip014/"
      },
      {
        title: "Florida Legislature - Landlord and Tenant Statutes",
        url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Title=->2021->Chapter%2083"
      }
    ]
  },
  "new-york": {
    name: "New York",
    slug: "new-york",
    description: "New York has extensive tenant protections, especially in New York City where rent stabilization and rent control laws apply to many units. The state has strict security deposit limits and comprehensive tenant rights regarding repairs, privacy, and eviction.",
    securityDepositLimit: "1 month's rent for security deposits. No limit on advance rent or other fees, but must follow specific rules.",
    securityDepositReturn: "Reasonable time (typically 14-60 days depending on location). In NYC, must return within reasonable time or provide itemized statement.",
    rentIncreaseNotice: "30 days for month-to-month tenancies if tenant has lived there less than 1 year, 60 days if 1-2 years, 90 days if over 2 years. Rent-stabilized units have specific annual increase caps set by RGB.",
    entryNotice: "Reasonable notice required, typically 24 hours is standard. NYC laws may have additional requirements.",
    keyStatutes: [
      "NY General Obligations Law §7-103 - Security Deposits",
      "NY Real Property Law §235-b - Warranty of Habitability",
      "NY Real Property Law §226-c - Right to Receipts",
      "Rent Stabilization Law (NYC) - Rent Increase Limits"
    ],
    commonIssues: [
      "Charging deposits exceeding one month's rent",
      "Improper handling of rent-stabilized unit increases",
      "Failure to maintain apartments in habitable condition",
      "Harassment or illegal lockouts",
      "Not providing required lease disclosures and receipts"
    ],
    resources: [
      {
        title: "NY State Attorney General - Tenants' Rights Guide",
        url: "https://ag.ny.gov/sites/default/files/tenants_rights.pdf"
      },
      {
        title: "NYC Housing Preservation & Development",
        url: "https://www.nyc.gov/site/hpd/index.page"
      }
    ]
  },
  illinois: {
    name: "Illinois",
    slug: "illinois",
    description: "Illinois landlord-tenant law provides substantial protections for tenants, particularly in Chicago where additional local ordinances apply. The state has clear requirements for security deposits, property maintenance, and eviction procedures.",
    securityDepositLimit: "No statewide limit, but many municipalities have caps. Chicago limits deposits to 1.5-2 months' rent depending on unit type.",
    securityDepositReturn: "30-45 days depending on length of occupancy. Must include itemized statement for any deductions. Interest must be paid on deposits in some cities.",
    rentIncreaseNotice: "No statewide requirement for month-to-month leases, but 30 days is customary. Chicago requires 30 days notice; some units under rent control need 60 days.",
    entryNotice: "No statewide requirement, but 24 hours notice is standard and required in many local ordinances including Chicago RLTO.",
    keyStatutes: [
      "Illinois Compiled Statutes 765 ILCS 710 - Security Deposit Return Act",
      "Illinois Compiled Statutes 765 ILCS 705 - Security Deposit Interest Act",
      "Chicago RLTO - Residential Landlord and Tenant Ordinance",
      "Illinois Compiled Statutes 735 ILCS 5/9 - Eviction Process"
    ],
    commonIssues: [
      "Failure to pay required interest on security deposits (Chicago)",
      "Not returning deposits within required timeframe",
      "Improper deductions without itemization",
      "Entry without proper notice",
      "Retaliatory eviction after tenant requests repairs"
    ],
    resources: [
      {
        title: "Illinois Attorney General - Landlord-Tenant Rights",
        url: "https://www.illinoisattorneygeneral.gov/consumers/landlordtenantrights.html"
      },
      {
        title: "Chicago RLTO Information",
        url: "https://www.chicago.gov/city/en/depts/doh/provdrs/landlords/svcs/learn-about-the-chicago-residential-landlord-and-tenant-ordinance.html"
      }
    ]
  },
  pennsylvania: {
    name: "Pennsylvania",
    slug: "pennsylvania",
    description: "Pennsylvania's landlord-tenant laws establish baseline protections while allowing considerable flexibility in lease agreements. Security deposit rules and habitability requirements are clearly defined, though local ordinances in Philadelphia and Pittsburgh may add additional requirements.",
    securityDepositLimit: "2 months' rent for first year of tenancy, 1 month's rent for second and subsequent years.",
    securityDepositReturn: "30 days after lease termination. Must provide itemized list of damages if making deductions.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but 30-60 days is customary. Must follow lease terms for fixed leases.",
    entryNotice: "No statutory requirement, but reasonable notice (typically 24 hours) should be provided except in emergencies.",
    keyStatutes: [
      "Pennsylvania Statutes Title 68 §250.511 - Security Deposits",
      "Pennsylvania Statutes Title 68 §250.512 - Interest on Deposits",
      "Pennsylvania Statutes Title 68 §250.206 - Landlord Responsibilities",
      "Pennsylvania Statutes Title 35 §1700-1 - Clean Indoor Air Act"
    ],
    commonIssues: [
      "Charging excessive deposits (over 2 months' rent in first year)",
      "Failure to hold deposits in escrow accounts",
      "Not paying required interest on deposits for leases over 2 years",
      "Improper deductions from security deposits",
      "Failure to maintain habitable premises"
    ],
    resources: [
      {
        title: "PA Department of Community & Economic Development",
        url: "https://dced.pa.gov/programs/landlord-tenant-law/"
      },
      {
        title: "Pennsylvania Bar Association - Landlord-Tenant Law",
        url: "https://www.pabar.org/public/consumer/landlordtenant.asp"
      }
    ]
  },
  ohio: {
    name: "Ohio",
    slug: "ohio",
    description: "Ohio landlord-tenant law provides basic protections for both landlords and tenants, with clear guidelines on security deposits, repairs, and eviction. Local ordinances in cities like Cleveland and Columbus may impose additional requirements.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after tenant vacates and returns keys. Must include itemized statement if making deductions.",
    rentIncreaseNotice: "No statutory requirement for month-to-month leases, but 30 days notice is customary and recommended.",
    entryNotice: "Reasonable notice required, typically 24 hours is considered reasonable except in emergencies.",
    keyStatutes: [
      "Ohio Revised Code §5321.16 - Security Deposits",
      "Ohio Revised Code §5321.04 - Landlord Obligations",
      "Ohio Revised Code §5321.05 - Tenant Obligations",
      "Ohio Revised Code §5321.17 - Termination of Periodic Tenancies"
    ],
    commonIssues: [
      "Failure to return deposits within 30 days",
      "Not providing itemized deductions",
      "Landlord self-help evictions (illegal)",
      "Failure to make necessary repairs",
      "Improper notice for entry or lease termination"
    ],
    resources: [
      {
        title: "Ohio State Bar Association - Landlord/Tenant Law",
        url: "https://www.ohiobar.org/public-resources/commonly-asked-law-questions/housing-law/"
      },
      {
        title: "Ohio Legal Services - Tenant Rights",
        url: "https://www.ohiolegalservices.org/public/legal_problem/housing/landlord-tenant-law"
      }
    ]
  },
  georgia: {
    name: "Georgia",
    slug: "georgia",
    description: "Georgia's landlord-tenant laws are relatively landlord-friendly, with few statutory requirements beyond security deposit handling and basic habitability standards. However, lease terms and local ordinances may impose additional obligations.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after tenant moves out if no forwarding address provided, or within 30 days of receiving forwarding address. Must include itemized list of deductions.",
    rentIncreaseNotice: "60 days notice required for month-to-month tenancies to increase rent or change other lease terms.",
    entryNotice: "No statutory requirement, but lease should specify reasonable notice terms.",
    keyStatutes: [
      "Georgia Code §44-7-30 through §44-7-37 - Security Deposits",
      "Georgia Code §44-7-13 - Warranty of Habitability",
      "Georgia Code §44-7-7 - Tenant's Duties",
      "Georgia Code §44-7-50 - Landlord's Right to Terminate"
    ],
    commonIssues: [
      "Failure to return deposits with itemization within 30 days",
      "Landlords making excessive or unjustified deductions",
      "Not maintaining basic habitability standards",
      "Improper eviction procedures",
      "Not providing proper notice for rent increases"
    ],
    resources: [
      {
        title: "Georgia Department of Community Affairs - Landlord-Tenant Handbook",
        url: "https://www.dca.ga.gov/safe-affordable-housing/landlord-tenant-information"
      },
      {
        title: "Georgia Legal Aid - Tenant Rights",
        url: "https://www.georgialegalaid.org/topics/126/housing"
      }
    ]
  },
  washington: {
    name: "Washington",
    slug: "washington",
    description: "Washington State has comprehensive tenant protections with clear security deposit limits, notice requirements, and habitability standards. The state requires landlords to follow specific procedures for deposits, repairs, and evictions.",
    securityDepositLimit: "No statutory limit, but must be reasonable. Seattle limits deposits to 1 month's rent.",
    securityDepositReturn: "21 days after tenant vacates. Must include itemized statement of any deductions. Failure to comply may result in landlord forfeiting right to withhold any deposit.",
    rentIncreaseNotice: "30 days for month-to-month tenancies. 60 days if increase is 10% or more within 12 months (new 2024 law). 120 days in some Seattle rental agreements.",
    entryNotice: "48 hours advance notice required for non-emergency entry. Notice must be in writing except in certain emergency situations.",
    keyStatutes: [
      "RCW 59.18.260 - Security Deposit Requirements",
      "RCW 59.18.280 - Security Deposit Return",
      "RCW 59.18.060 - Landlord's Duties",
      "RCW 59.18.140 - Notice Requirements for Entry"
    ],
    commonIssues: [
      "Not returning deposits within 21 days with itemization",
      "Entering without proper 48-hour notice",
      "Failure to maintain premises in habitable condition",
      "Not providing adequate notice for rent increases",
      "Improper termination or eviction procedures"
    ],
    resources: [
      {
        title: "Washington State Attorney General - Landlord-Tenant Law",
        url: "https://www.atg.wa.gov/residential-landlord-tenant-resources"
      },
      {
        title: "Washington Law Help - Tenants' Rights",
        url: "https://www.washingtonlawhelp.org/issues/housing"
      }
    ]
  },
  arizona: {
    name: "Arizona",
    slug: "arizona",
    description: "Arizona's Residential Landlord and Tenant Act provides a comprehensive framework for rental relationships, with specific requirements for security deposits, property maintenance, and lease terminations. The law balances landlord and tenant rights while emphasizing habitability standards.",
    securityDepositLimit: "1.5 months' rent for security deposit.",
    securityDepositReturn: "14 business days after tenant vacates. Must include itemized statement of any deductions.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "48 hours notice required for non-emergency entry. Notice can be written or verbal.",
    keyStatutes: [
      "Arizona Revised Statutes §33-1321 - Security Deposits",
      "Arizona Revised Statutes §33-1324 - Landlord's Duty to Maintain",
      "Arizona Revised Statutes §33-1343 - Landlord's Right of Entry",
      "Arizona Revised Statutes §33-1375 - Termination of Tenancy"
    ],
    commonIssues: [
      "Not returning deposits within 14 business days",
      "Failure to provide itemized deductions",
      "Entering without 48-hour notice",
      "Not maintaining air conditioning (considered essential in Arizona)",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Arizona Department of Housing",
        url: "https://housing.az.gov/general-public/landlord-and-tenant-act"
      },
      {
        title: "Arizona Tenants Union",
        url: "https://www.arizonatenants.org/"
      }
    ]
  }
};

// Helper function to get all state slugs
export const getAllStateSlugs = (): string[] => {
  return Object.keys(stateData);
};

// Helper function to get state by slug
export const getStateBySlug = (slug: string): StateInfo | undefined => {
  return stateData[slug];
};
