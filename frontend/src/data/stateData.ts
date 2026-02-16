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
  },
  alabama: {
    name: "Alabama",
    slug: "alabama",
    description: "Alabama landlord-tenant law provides minimal statutory requirements, with most rental terms governed by lease agreements and common law. While there are limited statewide tenant protections, landlords must still comply with basic security deposit and habitability requirements.",
    securityDepositLimit: "No statutory limit on security deposit amounts, but must be reasonable.",
    securityDepositReturn: "60 days after termination of tenancy and delivery of possession. Must provide itemized list of deductions.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "No statutory requirement, but reasonable notice (typically 24 hours) is customary and should be specified in lease.",
    keyStatutes: [
      "Alabama Code §35-9A-201 - Security Deposits",
      "Alabama Code §35-9A-204 - Landlord's Disclosure",
      "Alabama Code §35-9A-301 - Landlord Obligations",
      "Alabama Code §6-6-310 - Unlawful Eviction"
    ],
    commonIssues: [
      "Not returning deposits within 60 days",
      "Failure to provide itemized deductions",
      "Self-help evictions (illegal)",
      "Not maintaining basic habitability standards",
      "Improper notice for rent increases"
    ],
    resources: [
      {
        title: "Alabama Law - Uniform Residential Landlord and Tenant Act",
        url: "https://codes.findlaw.com/al/title-35-property/al-code-sect-35-9a-101/"
      },
      {
        title: "Legal Services Alabama - Tenant Rights",
        url: "https://www.legalservicesalabama.org/housing"
      }
    ]
  },
  colorado: {
    name: "Colorado",
    slug: "colorado",
    description: "Colorado landlord-tenant law establishes clear requirements for security deposits, habitability, and lease terminations. The state emphasizes tenant rights while providing specific procedures landlords must follow for entry, repairs, and evictions.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days (or 60 days if specified in lease) after termination of lease. Must include itemized statement of deductions. One month's rent or actual damages if landlord fails to return deposit within specified timeframe.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but 30-60 days is customary. Some local jurisdictions may have specific requirements.",
    entryNotice: "Reasonable notice required, no specific timeframe stated but 24 hours is standard practice.",
    keyStatutes: [
      "Colorado Revised Statutes §38-12-102 - Security Deposits",
      "Colorado Revised Statutes §38-12-103 - Wrongful Retention of Deposits",
      "Colorado Revised Statutes §38-12-507 - Landlord's Duty to Maintain",
      "Colorado Revised Statutes §13-40-107 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Failure to provide itemized deductions",
      "Improper withholding of security deposits",
      "Not maintaining premises in habitable condition",
      "Entering without reasonable notice"
    ],
    resources: [
      {
        title: "Colorado Legal Services - Tenant Rights",
        url: "https://www.coloradolegalservices.org/node/12/landlord-tenant-problems"
      },
      {
        title: "Colorado Attorney General - Consumer Protection",
        url: "https://coag.gov/resources/landlord-tenant-rights/"
      }
    ]
  },
  indiana: {
    name: "Indiana",
    slug: "indiana",
    description: "Indiana's landlord-tenant laws provide a framework for rental relationships with specific requirements for security deposits, property maintenance, and eviction procedures. The state balances landlord property rights with tenant protections.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "45 days after tenant vacates. Must provide itemized statement of any deductions. If landlord fails to comply, tenant may recover deposit plus damages.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but 30 days notice is customary. Must follow lease terms.",
    entryNotice: "Reasonable notice required, typically 24 hours is considered reasonable except in emergencies.",
    keyStatutes: [
      "Indiana Code §32-31-3-12 - Security Deposits",
      "Indiana Code §32-31-3-9 - Landlord Obligations",
      "Indiana Code §32-31-5-6 - Right of Entry",
      "Indiana Code §32-31-1-8 - Eviction Procedures"
    ],
    commonIssues: [
      "Not returning deposits within 45 days",
      "Failure to provide itemized deductions",
      "Not making necessary repairs",
      "Entering without reasonable notice",
      "Self-help evictions (illegal)"
    ],
    resources: [
      {
        title: "Indiana Legal Services - Housing",
        url: "https://www.indianalegalservices.org/housing"
      },
      {
        title: "Indiana Attorney General - Consumer Protection",
        url: "https://www.in.gov/attorneygeneral/consumer-protection-division/"
      }
    ]
  },
  louisiana: {
    name: "Louisiana",
    slug: "louisiana",
    description: "Louisiana's landlord-tenant law is unique due to the state's civil law tradition. Lease agreements are governed by the Louisiana Civil Code, which provides specific requirements for security deposits, repairs, and lease terminations.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after termination of lease. Must provide itemized statement of any deductions.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies. 10 days notice required to terminate month-to-month lease.",
    entryNotice: "No statutory requirement, but reasonable notice should be provided as specified in lease agreement.",
    keyStatutes: [
      "Louisiana Civil Code Art. 2683 - Lease Obligations",
      "Louisiana Civil Code Art. 2707 - Security Deposits",
      "Louisiana Civil Code Art. 2682 - Repairs and Maintenance",
      "Louisiana Code of Civil Procedure Art. 4701 - Eviction"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Not maintaining premises in good repair",
      "Improper eviction procedures",
      "Disputes over lease interpretation"
    ],
    resources: [
      {
        title: "Louisiana State Bar Association - Landlord-Tenant Law",
        url: "https://www.lsba.org/Public/LegalResources.aspx"
      },
      {
        title: "Southeast Louisiana Legal Services",
        url: "https://slls.org/what-we-do/housing/"
      }
    ]
  },
  maryland: {
    name: "Maryland",
    slug: "maryland",
    description: "Maryland has comprehensive tenant protection laws with detailed requirements for security deposits, rent increases, and habitability standards. The state provides strong enforcement mechanisms and penalties for landlord non-compliance.",
    securityDepositLimit: "2 months' rent for security deposits.",
    securityDepositReturn: "45 days after termination of tenancy. Must provide itemized list of damages and costs. Failure to comply results in forfeiture of right to withhold deposit plus possible penalties of 3 times the deposit.",
    rentIncreaseNotice: "1 month notice for month-to-month leases if rent increase is less than 10%, 2 months notice if 10% or more. No increases during lease term unless specified.",
    entryNotice: "Reasonable notice required, typically 24 hours except in emergencies.",
    keyStatutes: [
      "Maryland Real Property Code §8-203 - Security Deposits",
      "Maryland Real Property Code §8-203.1 - Interest on Deposits",
      "Maryland Real Property Code §8-208 - Landlord's Duties",
      "Maryland Real Property Code §8-402 - Retaliatory Eviction"
    ],
    commonIssues: [
      "Not returning deposits within 45 days with itemization",
      "Failure to pay interest on deposits (required in some counties)",
      "Not providing adequate notice for rent increases",
      "Retaliatory actions against tenants",
      "Failure to register rental properties (required in some jurisdictions)"
    ],
    resources: [
      {
        title: "Maryland Attorney General - Tenant Rights",
        url: "https://www.marylandattorneygeneral.gov/Pages/CPD/landlords.aspx"
      },
      {
        title: "Maryland Courts - Landlord-Tenant Information",
        url: "https://www.mdcourts.gov/legalhelp/landlordtenant"
      }
    ]
  },
  massachusetts: {
    name: "Massachusetts",
    slug: "massachusetts",
    description: "Massachusetts has some of the strongest tenant protection laws in the nation. The state requires landlords to follow strict procedures for security deposits, provides detailed habitability standards, and offers significant remedies for tenant rights violations.",
    securityDepositLimit: "1 month's rent for security deposit. First month's rent, last month's rent, security deposit, and lock/key deposit are the only upfront payments allowed.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized list of damages with receipts or estimates. Deposit must be held in separate interest-bearing account in Massachusetts bank.",
    rentIncreaseNotice: "30 days notice for tenancies at will. Cannot increase rent in retaliation for tenant asserting rights.",
    entryNotice: "No statutory requirement, but reasonable notice is required. Landlord cannot abuse right of access.",
    keyStatutes: [
      "Massachusetts General Laws Chapter 186 §15B - Security Deposits",
      "Massachusetts General Laws Chapter 239 §2A - Summary Process",
      "Massachusetts General Laws Chapter 186 §14 - Warranty of Habitability",
      "State Sanitary Code 105 CMR 410 - Minimum Standards"
    ],
    commonIssues: [
      "Not holding deposits in proper bank accounts with interest",
      "Failure to provide itemized deductions with receipts",
      "Not complying with strict security deposit laws (treble damages possible)",
      "Retaliatory eviction after tenant complaints",
      "Failure to provide lead paint certificates"
    ],
    resources: [
      {
        title: "Massachusetts Attorney General - Landlord-Tenant Guide",
        url: "https://www.mass.gov/guides/the-attorney-generals-guide-to-landlord-and-tenant-rights"
      },
      {
        title: "MassLegalHelp - Housing",
        url: "https://www.masslegalhelp.org/housing"
      }
    ]
  },
  michigan: {
    name: "Michigan",
    slug: "michigan",
    description: "Michigan's Truth in Renting Act provides comprehensive landlord-tenant regulations. The state has specific requirements for security deposits, habitability standards, and detailed notice requirements for various landlord actions.",
    securityDepositLimit: "1.5 months' rent for security deposit.",
    securityDepositReturn: "30 days after termination of occupancy. Must provide itemized list of damages within 4 days of tenant providing forwarding address.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but reasonable notice (30 days) is customary. Must comply with lease terms.",
    entryNotice: "Reasonable notice required, typically 24 hours is considered reasonable except in emergencies.",
    keyStatutes: [
      "Michigan Compiled Laws §554.601-616 - Truth in Renting Act",
      "Michigan Compiled Laws §554.608 - Security Deposits",
      "Michigan Compiled Laws §125.1436 - State Housing Development Authority",
      "Michigan Compiled Laws §600.5701 - Summary Proceedings"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Failure to provide itemized damages list within 4 days",
      "Charging deposits exceeding 1.5 months' rent",
      "Not maintaining premises in habitable condition",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Michigan Legislature - Truth in Renting Act",
        url: "http://www.legislature.mi.gov/(S(rnwugsw4mufhkgfpjylrtxuk))/mileg.aspx?page=getObject&objectName=mcl-554-601"
      },
      {
        title: "Michigan Legal Help - Housing",
        url: "https://michiganlegalhelp.org/self-help-tools/housing"
      }
    ]
  },
  minnesota: {
    name: "Minnesota",
    slug: "minnesota",
    description: "Minnesota landlord-tenant law provides balanced protections with specific requirements for security deposits, rent receipts, and property maintenance. The state has detailed statutory provisions and local ordinances in cities like Minneapolis and St. Paul add additional protections.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "21 days after tenant vacates and returns keys. Must provide itemized statement of any deductions. 3 weeks plus 5 days if withholding any portion.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but reasonable notice is customary. Minneapolis requires written notice equal to one rental period.",
    entryNotice: "Reasonable notice required (typically 24 hours), must be during reasonable hours unless emergency.",
    keyStatutes: [
      "Minnesota Statutes §504B.178 - Security Deposits",
      "Minnesota Statutes §504B.161 - Landlord Duties",
      "Minnesota Statutes §504B.211 - Right of Entry",
      "Minnesota Statutes §504B.285 - Eviction Actions"
    ],
    commonIssues: [
      "Not returning deposits within 21 days",
      "Failure to provide itemized deductions",
      "Entering without reasonable notice",
      "Not maintaining heating systems (critical in Minnesota)",
      "Retaliatory actions against tenants"
    ],
    resources: [
      {
        title: "Minnesota Attorney General - Landlord-Tenant Rights",
        url: "https://www.ag.state.mn.us/consumer/handbooks/LT/default.asp"
      },
      {
        title: "HOME Line - Minnesota Tenant Advocacy",
        url: "https://homelinemn.org/"
      }
    ]
  },
  missouri: {
    name: "Missouri",
    slug: "missouri",
    description: "Missouri landlord-tenant law provides basic requirements for rental relationships with specific provisions for security deposits and habitability. While generally landlord-friendly, the state has clear rules landlords must follow regarding deposits and property maintenance.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized list of deductions.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies. Reasonable notice is customary.",
    entryNotice: "No statutory requirement, but reasonable notice should be provided as specified in lease.",
    keyStatutes: [
      "Missouri Revised Statutes §535.300 - Security Deposits",
      "Missouri Revised Statutes §441.570 - Landlord Obligations",
      "Missouri Revised Statutes §441.060 - Notice to Terminate",
      "Missouri Revised Statutes Chapter 534 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Not maintaining basic habitability",
      "Improper eviction procedures",
      "Disputes over lease terms"
    ],
    resources: [
      {
        title: "Missouri Attorney General - Consumer Protection",
        url: "https://ago.mo.gov/home/consumers"
      },
      {
        title: "Legal Aid of Western Missouri - Housing",
        url: "https://www.lawmo.org/housing"
      }
    ]
  },
  "south-carolina": {
    name: "South Carolina",
    slug: "south-carolina",
    description: "South Carolina's Residential Landlord and Tenant Act establishes comprehensive rules for rental housing. The state has specific requirements for security deposits, property maintenance, and lease terminations that both parties must follow.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of any deductions.",
    rentIncreaseNotice: "No statutory requirement, but reasonable notice is required. Check local ordinances and lease terms.",
    entryNotice: "24 hours notice required for non-emergency entry. Must be at reasonable times.",
    keyStatutes: [
      "South Carolina Code §27-40-410 - Security Deposits",
      "South Carolina Code §27-40-440 - Landlord's Obligations",
      "South Carolina Code §27-40-530 - Right of Entry",
      "South Carolina Code §27-40-710 - Termination Procedures"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Entering without 24-hour notice",
      "Not maintaining habitability standards",
      "Improper lease termination procedures"
    ],
    resources: [
      {
        title: "South Carolina Bar - Landlord-Tenant Law",
        url: "https://www.scbar.org/public/get-legal-help/common-legal-topics/landlord-tenant-law/"
      },
      {
        title: "SC Legal Services - Housing",
        url: "https://sclegal.org/housing-and-homelessness"
      }
    ]
  },
  tennessee: {
    name: "Tennessee",
    slug: "tennessee",
    description: "Tennessee's Uniform Residential Landlord and Tenant Act provides a comprehensive legal framework for rental housing. The state has clear requirements for security deposits, habitability standards, and eviction procedures that protect both landlord and tenant interests.",
    securityDepositLimit: "No statutory limit, but some counties and cities may have local restrictions.",
    securityDepositReturn: "30 days after termination of tenancy if no deductions. Must provide itemized list within 30 days if withholding any portion.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but 30 days notice is customary. Must follow lease terms.",
    entryNotice: "Reasonable notice required, typically 24 hours except in emergencies. Must be at reasonable times.",
    keyStatutes: [
      "Tennessee Code §66-28-301 - Security Deposits",
      "Tennessee Code §66-28-304 - Landlord's Obligations",
      "Tennessee Code §66-28-403 - Right of Entry",
      "Tennessee Code §66-28-505 - Eviction Procedures"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Not making necessary repairs",
      "Entering without reasonable notice",
      "Self-help evictions (illegal)"
    ],
    resources: [
      {
        title: "Tennessee Attorney General - Consumer Protection",
        url: "https://www.tn.gov/attorneygeneral/working-for-tennessee/consumer-protection.html"
      },
      {
        title: "Legal Aid Society of Middle Tennessee",
        url: "https://www.las.org/housing"
      }
    ]
  },
  virginia: {
    name: "Virginia",
    slug: "virginia",
    description: "Virginia's Residential Landlord and Tenant Act establishes detailed requirements for rental housing relationships. The state provides specific procedures for security deposits, rent increases, property maintenance, and evictions.",
    securityDepositLimit: "2 months' rent for security deposits.",
    securityDepositReturn: "45 days after termination of tenancy. Must provide itemized list of damages. If landlord fails to return deposit or provide itemization, tenant may recover full amount plus damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "72 hours notice required for routine maintenance, 24 hours for emergencies, or as specified in lease.",
    keyStatutes: [
      "Virginia Code §55.1-1226 - Security Deposits",
      "Virginia Code §55.1-1227 - Move-in Inspection",
      "Virginia Code §55.1-1230 - Landlord's Duties",
      "Virginia Code §55.1-1253 - Right of Entry"
    ],
    commonIssues: [
      "Not returning deposits within 45 days with itemization",
      "Failure to conduct move-in inspection",
      "Entering without proper notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Virginia Department of Housing - Landlord-Tenant Handbook",
        url: "https://www.dhcd.virginia.gov/landlord-tenant-resources"
      },
      {
        title: "Legal Aid Justice Center - Housing",
        url: "https://www.justice4all.org/housing/"
      }
    ]
  },
  wisconsin: {
    name: "Wisconsin",
    slug: "wisconsin",
    description: "Wisconsin's landlord-tenant laws provide comprehensive protections with specific requirements for security deposits, property maintenance, and lease procedures. The state mandates detailed check-in/check-out procedures and strict security deposit handling.",
    securityDepositLimit: "No statutory limit, but must be reasonable. Some municipalities may have caps.",
    securityDepositReturn: "21 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover double the withheld amount.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but reasonable notice (typically 30 days) is customary.",
    entryNotice: "Advance notice required as specified in lease, typically 12-24 hours is reasonable except in emergencies.",
    keyStatutes: [
      "Wisconsin Statutes §704.28 - Security Deposits",
      "Wisconsin Statutes §704.07 - Repairs and Maintenance",
      "Wisconsin Statutes §704.05 - Right of Entry",
      "Wisconsin Statutes §704.17 - Termination Procedures"
    ],
    commonIssues: [
      "Not returning deposits within 21 days",
      "Failure to provide itemized damages",
      "Not conducting proper move-in/move-out inspections",
      "Entering without adequate notice",
      "Not maintaining heating (critical in Wisconsin winters)"
    ],
    resources: [
      {
        title: "Wisconsin Department of Agriculture - Landlord-Tenant Law",
        url: "https://datcp.wi.gov/Pages/Programs_Services/TenantRights.aspx"
      },
      {
        title: "Legal Action of Wisconsin - Housing",
        url: "https://www.legalaction.org/areas-of-law/housing/"
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
