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
    securityDepositReturn: "Deposit must be returned within 30 days of termination of tenancy. Itemized damage list must be provided within 4 days of receiving forwarding address.",
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
    securityDepositReturn: "21 days after tenant vacates and returns keys, or 26 days if withholding any portion. Must provide itemized statement of any deductions.",
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
  },
  kentucky: {
    name: "Kentucky",
    slug: "kentucky",
    description: "Kentucky's Uniform Residential Landlord and Tenant Act provides comprehensive regulations for rental housing. The state has specific requirements for security deposits, maintenance obligations, and detailed eviction procedures.",
    securityDepositLimit: "No statutory limit, but deposits must be reasonable.",
    securityDepositReturn: "30-60 days after termination of tenancy (30 days if no deductions, 60 days if itemizing deductions). Must provide written itemization of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "2 days notice required for entry, except in emergencies.",
    keyStatutes: [
      "Kentucky Revised Statutes §383.580 - Security Deposits",
      "Kentucky Revised Statutes §383.595 - Landlord Obligations",
      "Kentucky Revised Statutes §383.615 - Right of Entry",
      "Kentucky Revised Statutes §383.660 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Failure to provide itemized deductions",
      "Entering without 2-day notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Kentucky Attorney General - Consumer Protection",
        url: "https://ag.ky.gov/Resources/Consumer-Protection/Pages/default.aspx"
      },
      {
        title: "Legal Aid Network of Kentucky",
        url: "https://www.kyjustice.org/"
      }
    ]
  },
  oregon: {
    name: "Oregon",
    slug: "oregon",
    description: "Oregon has strong tenant protection laws with strict rent control provisions, comprehensive security deposit regulations, and detailed notice requirements. The state recently enacted significant tenant-friendly reforms including rent increase caps and cause requirements for evictions.",
    securityDepositLimit: "No statutory limit on security deposits, but must be reasonable.",
    securityDepositReturn: "31 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover twice the amount wrongfully withheld.",
    rentIncreaseNotice: "90 days notice required for rent increases. Annual increases capped at 7% plus CPI (max 10%) statewide.",
    entryNotice: "24 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "Oregon Revised Statutes §90.300 - Security Deposits",
      "Oregon Revised Statutes §90.320 - Landlord Obligations",
      "Oregon Revised Statutes §90.322 - Right of Entry",
      "Oregon Revised Statutes §90.427 - Rent Increase Limits"
    ],
    commonIssues: [
      "Rent increases exceeding statutory caps",
      "Not providing 90-day notice for rent increases",
      "Failure to return deposits within 31 days",
      "No-cause evictions (now prohibited in most cases)",
      "Entering without 24-hour notice"
    ],
    resources: [
      {
        title: "Oregon State Bar - Landlord-Tenant Law",
        url: "https://www.osbar.org/public/legalinfo/1247_RentLaw.htm"
      },
      {
        title: "Oregon Law Help - Housing",
        url: "https://oregonlawhelp.org/topics/housing"
      }
    ]
  },
  oklahoma: {
    name: "Oklahoma",
    slug: "oklahoma",
    description: "Oklahoma's Residential Landlord and Tenant Act establishes clear requirements for rental relationships. The state provides specific guidelines for security deposits, property maintenance, and eviction procedures.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "45 days after termination of tenancy. Must provide itemized list of deductions. If deposit is not returned or itemization not provided, landlord forfeits right to retain any portion.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "1 day notice required for entry, except in emergencies.",
    keyStatutes: [
      "Oklahoma Statutes Title 41 §115 - Security Deposits",
      "Oklahoma Statutes Title 41 §118 - Landlord Obligations",
      "Oklahoma Statutes Title 41 §128 - Right of Entry",
      "Oklahoma Statutes Title 41 §131 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 45 days",
      "Failure to provide itemized deductions",
      "Entering without 1-day notice",
      "Not maintaining habitability standards",
      "Self-help evictions (illegal)"
    ],
    resources: [
      {
        title: "Oklahoma Bar Association - Landlord-Tenant Act",
        url: "https://www.okbar.org/freelegalinfo/landlordtenantact/"
      },
      {
        title: "Legal Aid Services of Oklahoma",
        url: "https://www.legalaidok.org/housing"
      }
    ]
  },
  connecticut: {
    name: "Connecticut",
    slug: "connecticut",
    description: "Connecticut has comprehensive tenant protection laws with strict security deposit regulations, detailed disclosure requirements, and strong habitability standards. The state provides clear procedures for lease agreements and evictions.",
    securityDepositLimit: "2 months' rent for tenants under 62 years old, 1 month's rent for tenants 62 or older.",
    securityDepositReturn: "30 days after termination of tenancy, or within 15 days of receiving tenant's forwarding address, whichever is later. Must provide itemized statement of deductions and deposit must be held in escrow account.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but reasonable notice is required. Some municipalities have specific requirements.",
    entryNotice: "Reasonable notice required, typically 24 hours except in emergencies.",
    keyStatutes: [
      "Connecticut General Statutes §47a-21 - Security Deposits",
      "Connecticut General Statutes §47a-7 - Landlord Obligations",
      "Connecticut General Statutes §47a-16 - Right of Entry",
      "Connecticut General Statutes §47a-23 - Eviction Process"
    ],
    commonIssues: [
      "Not holding deposits in escrow accounts",
      "Charging deposits above legal limits",
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "CT Judicial Branch - Housing Matters",
        url: "https://www.jud.ct.gov/lawlib/housing.htm"
      },
      {
        title: "Connecticut Fair Housing Center",
        url: "https://www.ctfairhousing.org/"
      }
    ]
  },
  utah: {
    name: "Utah",
    slug: "utah",
    description: "Utah's landlord-tenant law provides balanced protections with specific requirements for security deposits and rental agreements. The state follows the Utah Fit Premises Act for habitability standards.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after termination of tenancy, or within 30 days after tenant provides forwarding address. Must provide itemized list of damages.",
    rentIncreaseNotice: "15 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required, typically 24 hours except in emergencies.",
    keyStatutes: [
      "Utah Code §57-22-4 - Security Deposits",
      "Utah Code §57-22-5 - Landlord Obligations (Fit Premises Act)",
      "Utah Code §78B-6-812 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Not maintaining habitability under Fit Premises Act",
      "Entering without reasonable notice",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Utah State Courts - Landlord-Tenant Resources",
        url: "https://www.utcourts.gov/howto/landlord/"
      },
      {
        title: "Utah Legal Services - Housing",
        url: "https://www.utahlegalservices.org/housing"
      }
    ]
  },
  iowa: {
    name: "Iowa",
    slug: "iowa",
    description: "Iowa's landlord-tenant law provides clear guidelines for rental relationships with specific requirements for security deposits, property maintenance, and lease procedures.",
    securityDepositLimit: "2 months' rent for security deposits.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover deposit amount plus actual damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "24 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "Iowa Code §562A.12 - Security Deposits",
      "Iowa Code §562A.15 - Landlord Obligations",
      "Iowa Code §562A.19 - Right of Entry",
      "Iowa Code §562A.27 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Entering without 24-hour notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Iowa Attorney General - Tenant Rights",
        url: "https://www.iowaattorneygeneral.gov/for-consumers/consumer-protection"
      },
      {
        title: "Iowa Legal Aid - Housing",
        url: "https://www.iowalegalaid.org/topics/housing"
      }
    ]
  },
  nevada: {
    name: "Nevada",
    slug: "nevada",
    description: "Nevada's landlord-tenant law provides specific requirements for rental housing with detailed security deposit regulations and eviction procedures. The state has relatively landlord-friendly laws but still requires compliance with basic tenant protections.",
    securityDepositLimit: "3 months' rent for security deposits.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of deductions. If landlord fails to comply, tenant may recover deposit plus damages.",
    rentIncreaseNotice: "45 days notice required for month-to-month tenancies if rent increase is 5% or more. 30 days for increases under 5%.",
    entryNotice: "24 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "Nevada Revised Statutes §118A.242 - Security Deposits",
      "Nevada Revised Statutes §118A.290 - Landlord Obligations",
      "Nevada Revised Statutes §118A.330 - Right of Entry",
      "Nevada Revised Statutes §40.253 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 30 days",
      "Not providing proper notice for rent increases",
      "Failure to provide itemized deductions",
      "Entering without 24-hour notice",
      "Self-help evictions (illegal)"
    ],
    resources: [
      {
        title: "Nevada Judiciary - Landlord-Tenant Information",
        url: "https://www.clarkcountycourts.us/self-help/eviction-information/"
      },
      {
        title: "Legal Aid Center of Southern Nevada",
        url: "https://www.lacsn.org/housing"
      }
    ]
  },
  arkansas: {
    name: "Arkansas",
    slug: "arkansas",
    description: "Arkansas has relatively landlord-friendly laws with fewer statutory tenant protections compared to many other states. However, landlords must still comply with security deposit requirements and basic habitability standards.",
    securityDepositLimit: "2 months' rent for security deposits.",
    securityDepositReturn: "60 days after termination of tenancy. Must provide itemized statement of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "No statutory requirement, but reasonable notice (typically 24 hours) is customary.",
    keyStatutes: [
      "Arkansas Code §18-16-305 - Security Deposits",
      "Arkansas Code §18-16-303 - Landlord Obligations",
      "Arkansas Code §18-16-304 - Right of Entry",
      "Arkansas Code §18-17-701 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 60 days",
      "Failure to provide itemized deductions",
      "Not maintaining basic habitability",
      "Entering without reasonable notice",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Arkansas Attorney General - Consumer Protection",
        url: "https://arkansasag.gov/consumer-protection/"
      },
      {
        title: "Center for Arkansas Legal Services",
        url: "https://arlegalservices.org/housing"
      }
    ]
  },
  mississippi: {
    name: "Mississippi",
    slug: "mississippi",
    description: "Mississippi has minimal statutory landlord-tenant regulations, with most rental terms governed by lease agreements and common law. The state provides basic protections but is generally considered landlord-friendly.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "45 days after termination of tenancy. Must provide itemized statement of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "No statutory requirement, but reasonable notice is customary and should be specified in lease.",
    keyStatutes: [
      "Mississippi Code §89-8-21 - Security Deposits",
      "Mississippi Code §89-8-15 - Landlord Obligations",
      "Mississippi Code §89-7-27 - Eviction Process",
      "Common Law - Habitability Standards"
    ],
    commonIssues: [
      "Not returning deposits within 45 days",
      "Failure to provide itemized deductions",
      "Not maintaining basic habitability",
      "Entering without notice",
      "Self-help evictions (illegal)"
    ],
    resources: [
      {
        title: "Mississippi Bar - Legal Resources",
        url: "https://www.msbar.org/for-the-public/"
      },
      {
        title: "Mississippi Center for Legal Services",
        url: "https://www.mslegalservices.org/"
      }
    ]
  },
  kansas: {
    name: "Kansas",
    slug: "kansas",
    description: "Kansas landlord-tenant law provides balanced protections with specific requirements for security deposits and rental agreements. The Kansas Residential Landlord and Tenant Act governs most rental relationships.",
    securityDepositLimit: "1 month's rent for unfurnished units, 1.5 months' rent for furnished units.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover 1.5 times the deposit amount.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required, typically 24 hours except in emergencies.",
    keyStatutes: [
      "Kansas Statutes §58-2550 - Security Deposits",
      "Kansas Statutes §58-2553 - Landlord Obligations",
      "Kansas Statutes §58-2557 - Right of Entry",
      "Kansas Statutes §61-2310 - Eviction Process"
    ],
    commonIssues: [
      "Charging deposits above legal limits",
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Entering without reasonable notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "Kansas Attorney General - Consumer Protection",
        url: "https://ag.ks.gov/consumer-protection"
      },
      {
        title: "Kansas Legal Services - Housing",
        url: "https://www.kansaslegalservices.org/housing"
      }
    ]
  },
  "new-mexico": {
    name: "New Mexico",
    slug: "new-mexico",
    description: "New Mexico's Uniform Owner-Resident Relations Act provides comprehensive regulations for rental housing. The state has specific requirements for security deposits, property maintenance, and detailed lease procedures.",
    securityDepositLimit: "1 month's rent for leases under 1 year, no limit for longer leases.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages and deposit must be held in separate account.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "24 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "New Mexico Statutes §47-8-18 - Security Deposits",
      "New Mexico Statutes §47-8-20 - Landlord Obligations",
      "New Mexico Statutes §47-8-24 - Right of Entry",
      "New Mexico Statutes §47-8-33 - Eviction Process"
    ],
    commonIssues: [
      "Not holding deposits in separate accounts",
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Entering without 24-hour notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "New Mexico Courts - Landlord-Tenant Law",
        url: "https://www.nmcourts.gov/self-help/landlord-tenant.aspx"
      },
      {
        title: "New Mexico Legal Aid",
        url: "https://www.newmexicolegalaid.org/housing"
      }
    ]
  },
  nebraska: {
    name: "Nebraska",
    slug: "nebraska",
    description: "Nebraska's Uniform Residential Landlord and Tenant Act provides comprehensive regulations for rental relationships. The state has specific requirements for security deposits, maintenance obligations, and eviction procedures.",
    securityDepositLimit: "1 month's rent for security deposits.",
    securityDepositReturn: "14 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover deposit plus damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "1 day notice required for entry, except in emergencies.",
    keyStatutes: [
      "Nebraska Revised Statutes §76-1416 - Security Deposits",
      "Nebraska Revised Statutes §76-1419 - Landlord Obligations",
      "Nebraska Revised Statutes §76-1423 - Right of Entry",
      "Nebraska Revised Statutes §76-1431 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 14 days",
      "Charging deposits above 1 month's rent",
      "Failure to provide itemized deductions",
      "Entering without 1-day notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "Nebraska Judicial Branch - Landlord-Tenant Information",
        url: "https://supremecourt.nebraska.gov/self-help/landlord-tenant"
      },
      {
        title: "Legal Aid of Nebraska",
        url: "https://www.legalaidofnebraska.org/housing"
      }
    ]
  },
  idaho: {
    name: "Idaho",
    slug: "idaho",
    description: "Idaho's landlord-tenant law provides basic protections with specific requirements for security deposits and rental agreements. The state follows relatively landlord-friendly policies with clear eviction procedures.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "21 days after termination of tenancy, or up to 30 days if specified in lease. Must provide itemized statement of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies (15 days if rent is paid weekly). Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required as specified in lease, typically 24 hours except in emergencies.",
    keyStatutes: [
      "Idaho Code §6-321 - Security Deposits",
      "Idaho Code §6-320 - Landlord Obligations",
      "Idaho Code §55-208 - Right of Entry",
      "Idaho Code §6-310 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 21-30 days",
      "Failure to provide itemized deductions",
      "Entering without reasonable notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Idaho Courts - Landlord-Tenant Information",
        url: "https://isc.idaho.gov/civil/landlord-tenant"
      },
      {
        title: "Idaho Legal Aid Services",
        url: "https://www.idaholegalaid.org/housing"
      }
    ]
  },
  "west-virginia": {
    name: "West Virginia",
    slug: "west-virginia",
    description: "West Virginia's landlord-tenant law provides protections with specific requirements for security deposits and rental agreements. The state has clear procedures for lease agreements and evictions.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "60 days after termination of tenancy, or within 45 days if tenant provides forwarding address. Must provide itemized statement of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required, typically 24 hours except in emergencies.",
    keyStatutes: [
      "West Virginia Code §37-6A-1 - Residential Rental Agreements",
      "West Virginia Code §37-6-30 - Security Deposits",
      "West Virginia Code §37-6A-3 - Landlord Obligations",
      "West Virginia Code §55-3A-1 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Failure to provide itemized deductions",
      "Entering without reasonable notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "West Virginia State Bar - Legal Resources",
        url: "https://www.wvbar.org/public-resources/"
      },
      {
        title: "Legal Aid of West Virginia",
        url: "https://legalaidwv.org/housing"
      }
    ]
  },
  hawaii: {
    name: "Hawaii",
    slug: "hawaii",
    description: "Hawaii has comprehensive tenant protection laws with strict regulations on security deposits, rent increases, and property maintenance. The state provides strong habitability standards and detailed eviction procedures.",
    securityDepositLimit: "1 month's rent for security deposits.",
    securityDepositReturn: "14 days after termination of tenancy. Must provide itemized statement of damages. Deposit must be held in separate trust account.",
    rentIncreaseNotice: "45 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "2 days notice required for entry, except in emergencies.",
    keyStatutes: [
      "Hawaii Revised Statutes §521-44 - Security Deposits",
      "Hawaii Revised Statutes §521-42 - Landlord Obligations",
      "Hawaii Revised Statutes §521-53 - Right of Entry",
      "Hawaii Revised Statutes §666-1 - Eviction Process"
    ],
    commonIssues: [
      "Not holding deposits in trust accounts",
      "Not returning deposits within 14 days",
      "Not providing 45-day notice for rent increases",
      "Entering without 2-day notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "Hawaii Office of Consumer Protection - Landlord-Tenant",
        url: "https://cca.hawaii.gov/ocp/landlord-tenant/"
      },
      {
        title: "Legal Aid Society of Hawaii",
        url: "https://www.legalaidhawaii.org/housing"
      }
    ]
  },
  "new-hampshire": {
    name: "New Hampshire",
    slug: "new-hampshire",
    description: "New Hampshire's landlord-tenant law provides balanced protections with specific requirements for security deposits and rental agreements. The state has clear procedures for lease agreements and evictions.",
    securityDepositLimit: "1 month's rent for security deposits, plus an additional pet deposit of no more than 1 month's rent.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages. Deposit must be held in separate account in New Hampshire bank.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "Notice required as specified in lease, but must be reasonable. Typically 24 hours except in emergencies.",
    keyStatutes: [
      "New Hampshire RSA 540-A:6 - Security Deposits",
      "New Hampshire RSA 540-A:2 - Landlord Obligations",
      "New Hampshire RSA 540-A:3 - Right of Entry",
      "New Hampshire RSA 540:2 - Eviction Process"
    ],
    commonIssues: [
      "Not holding deposits in NH bank accounts",
      "Charging deposits above legal limits",
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "NH Housing - Tenant Rights",
        url: "https://www.nhhfa.org/homeownership-tenants/tenant-resources/"
      },
      {
        title: "NH Legal Assistance",
        url: "https://nhlegalaid.org/housing"
      }
    ]
  },
  "new-jersey": {
    name: "New Jersey",
    slug: "new-jersey",
    description: "New Jersey's Anti-Eviction Act and Truth in Renting laws provide strong tenant protections. The state has specific requirements for security deposits, lease disclosures, and detailed eviction procedures.",
    securityDepositLimit: "1.5 months' rent for security deposits, plus additional pet deposit allowed.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages and deposit must be held in separate interest-bearing account.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but 30 days is customary. Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required as specified in lease, typically 24 hours except in emergencies.",
    keyStatutes: [
      "New Jersey Statutes §46:8-19 - Security Deposits",
      "New Jersey Statutes §46:8-21.1 - Truth in Renting Act",
      "New Jersey Statutes §2A:18-61.1 - Anti-Eviction Act",
      "New Jersey Statutes §46:8-27 - Landlord Obligations"
    ],
    commonIssues: [
      "Not holding deposits in interest-bearing accounts",
      "Not returning deposits with interest within 30 days",
      "Failure to provide Truth in Renting statement",
      "Not providing itemized deductions",
      "Improper eviction procedures under Anti-Eviction Act"
    ],
    resources: [
      {
        title: "NJ Courts - Landlord-Tenant Information",
        url: "https://www.njcourts.gov/forms/11991_lt_tenant_kit.pdf"
      },
      {
        title: "NJ Department of Community Affairs - Tenants' Rights",
        url: "https://www.nj.gov/dca/divisions/codes/publications/pdf_lti/t_r_i.pdf"
      }
    ]
  },
  maine: {
    name: "Maine",
    slug: "maine",
    description: "Maine has strong tenant protection laws with comprehensive regulations for security deposits, property maintenance, and lease procedures. The state provides detailed requirements for rental agreements and evictions.",
    securityDepositLimit: "2 months' rent for security deposits.",
    securityDepositReturn: "30 days after termination of tenancy, or within 21 days if tenancy is at will. Must provide itemized statement of damages.",
    rentIncreaseNotice: "45 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "24 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "Maine Revised Statutes Title 14 §6033 - Security Deposits",
      "Maine Revised Statutes Title 14 §6021 - Landlord Obligations",
      "Maine Revised Statutes Title 14 §6025 - Right of Entry",
      "Maine Revised Statutes Title 14 §6001 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Charging deposits above 2 months' rent",
      "Failure to provide itemized deductions",
      "Not providing 45-day notice for rent increases",
      "Entering without 24-hour notice"
    ],
    resources: [
      {
        title: "Maine Attorney General - Renting in Maine",
        url: "https://www.maine.gov/ag/consumer/housing_rental.shtml"
      },
      {
        title: "Pine Tree Legal Assistance",
        url: "https://ptla.org/housing"
      }
    ]
  },
  montana: {
    name: "Montana",
    slug: "montana",
    description: "Montana's landlord-tenant law provides balanced protections with specific requirements for security deposits and rental agreements. The state has clear procedures for lease agreements and evictions.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after termination of tenancy, or within 10 days after receiving tenant's forwarding address. Must provide itemized statement of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "24 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "Montana Code §70-25-201 - Security Deposits",
      "Montana Code §70-24-303 - Landlord Obligations",
      "Montana Code §70-24-312 - Right of Entry",
      "Montana Code §70-27-101 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Failure to provide itemized deductions",
      "Entering without 24-hour notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Montana Department of Justice - Consumer Protection",
        url: "https://dojmt.gov/consumer/"
      },
      {
        title: "Montana Legal Services Association",
        url: "https://www.mtlsa.org/housing"
      }
    ]
  },
  "rhode-island": {
    name: "Rhode Island",
    slug: "rhode-island",
    description: "Rhode Island has comprehensive tenant protection laws with strict regulations on security deposits, rent increases, and property maintenance. The state provides strong habitability standards and detailed eviction procedures.",
    securityDepositLimit: "1 month's rent for security deposits.",
    securityDepositReturn: "20 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover twice the deposit amount.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "2 days notice required for entry, except in emergencies.",
    keyStatutes: [
      "Rhode Island General Laws §34-18-19 - Security Deposits",
      "Rhode Island General Laws §34-18-16 - Landlord Obligations",
      "Rhode Island General Laws §34-18-26 - Right of Entry",
      "Rhode Island General Laws §34-18-35 - Eviction Process"
    ],
    commonIssues: [
      "Charging deposits above 1 month's rent",
      "Not returning deposits within 20 days",
      "Failure to provide itemized deductions",
      "Entering without 2-day notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "Rhode Island Bar Association - Legal Resources",
        url: "https://www.ribar.com/for-the-public/"
      },
      {
        title: "Rhode Island Legal Services",
        url: "https://www.rils.org/housing"
      }
    ]
  },
  delaware: {
    name: "Delaware",
    slug: "delaware",
    description: "Delaware's Residential Landlord-Tenant Code provides comprehensive regulations for rental housing. The state has specific requirements for security deposits, property maintenance, and detailed lease procedures.",
    securityDepositLimit: "No statutory limit on security deposits, but must be reasonable. Some local ordinances may have limits.",
    securityDepositReturn: "20 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover twice the withheld amount.",
    rentIncreaseNotice: "60 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "2 days notice required for entry, except in emergencies.",
    keyStatutes: [
      "Delaware Code Title 25 §5514 - Security Deposits",
      "Delaware Code Title 25 §5305 - Landlord Obligations",
      "Delaware Code Title 25 §5509 - Right of Entry",
      "Delaware Code Title 25 §5701 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 20 days",
      "Not providing 60-day notice for rent increases",
      "Failure to provide itemized deductions",
      "Entering without 2-day notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "Delaware Courts - Landlord-Tenant Information",
        url: "https://courts.delaware.gov/help/landlord-tenant/"
      },
      {
        title: "Delaware Community Legal Aid Society",
        url: "https://declasi.org/housing"
      }
    ]
  },
  "south-dakota": {
    name: "South Dakota",
    slug: "south-dakota",
    description: "South Dakota's landlord-tenant law provides basic protections with specific requirements for security deposits and rental agreements. The state has relatively landlord-friendly policies with clear eviction procedures.",
    securityDepositLimit: "1 month's rent for security deposits (may be higher with written agreement).",
    securityDepositReturn: "2 weeks after termination of tenancy, or until tenant provides forwarding address, plus 45 days. Must provide itemized statement of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies (1 week for week-to-week). Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required as specified in lease, typically 24 hours except in emergencies.",
    keyStatutes: [
      "South Dakota Codified Laws §43-32-6.1 - Security Deposits",
      "South Dakota Codified Laws §43-32-8 - Landlord Obligations",
      "South Dakota Codified Laws §43-32-9 - Right of Entry",
      "South Dakota Codified Laws §21-16-1 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Failure to provide itemized deductions",
      "Entering without reasonable notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "South Dakota Bar Association - Legal Resources",
        url: "https://www.statebarofsouthdakota.com/page/PublicResources"
      },
      {
        title: "East River Legal Services",
        url: "https://www.erlservices.org/housing"
      }
    ]
  },
  "north-carolina": {
    name: "North Carolina",
    slug: "north-carolina",
    description: "North Carolina's Residential Rental Agreements Act provides comprehensive regulations for rental housing. The state has specific requirements for security deposits, late fees, and detailed lease procedures.",
    securityDepositLimit: "1.5 months' rent for month-to-month tenancies, 2 months' rent for leases longer than 2 months.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages. If deposit is not returned or accounted for, tenant may recover damages.",
    rentIncreaseNotice: "No statutory requirement for month-to-month tenancies, but reasonable notice (typically 30 days) is recommended. Must follow lease terms for fixed-term leases.",
    entryNotice: "No specific statutory requirement, but reasonable notice (typically 24 hours) is standard practice except in emergencies.",
    keyStatutes: [
      "North Carolina General Statutes §42-51 - Security Deposits",
      "North Carolina General Statutes §42-52 - Deposit Return",
      "North Carolina General Statutes §42-46 - Late Fee Restrictions",
      "North Carolina General Statutes §42-14 - Notice to Vacate"
    ],
    commonIssues: [
      "Charging deposits above legal limits",
      "Not returning deposits within 30 days",
      "Charging excessive late fees (max $15 or 5% of rent)",
      "Charging late fees before 5-day grace period",
      "Not providing itemized deductions"
    ],
    resources: [
      {
        title: "NC Bar Association - Tenant Rights",
        url: "https://www.ncbar.org/public-resources/find-legal-help/"
      },
      {
        title: "Legal Aid of North Carolina",
        url: "https://www.legalaidnc.org/get-help/housing"
      }
    ]
  },
  "north-dakota": {
    name: "North Dakota",
    slug: "north-dakota",
    description: "North Dakota's landlord-tenant law provides balanced protections with specific requirements for security deposits and rental agreements. The state has clear procedures for lease agreements and evictions.",
    securityDepositLimit: "1 month's rent for security deposits, or $2,500 if no monthly rent is specified.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "Reasonable notice required, typically 24 hours except in emergencies.",
    keyStatutes: [
      "North Dakota Century Code §47-16-07.1 - Security Deposits",
      "North Dakota Century Code §47-16-13 - Landlord Obligations",
      "North Dakota Century Code §47-16-07.3 - Right of Entry",
      "North Dakota Century Code §33-06-01 - Eviction Process"
    ],
    commonIssues: [
      "Charging deposits above legal limits",
      "Not returning deposits within 30 days",
      "Failure to provide itemized deductions",
      "Entering without reasonable notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "North Dakota Attorney General - Consumer Protection",
        url: "https://attorneygeneral.nd.gov/consumer-protection"
      },
      {
        title: "Legal Services of North Dakota",
        url: "https://www.legalassist.org/housing"
      }
    ]
  },
  alaska: {
    name: "Alaska",
    slug: "alaska",
    description: "Alaska's Uniform Residential Landlord and Tenant Act provides comprehensive regulations for rental housing. The state has specific requirements for security deposits, maintenance obligations, and detailed eviction procedures.",
    securityDepositLimit: "2 months' rent for security deposits.",
    securityDepositReturn: "14 days after termination of tenancy if tenant properly terminates, 30 days otherwise. Must provide itemized statement of damages.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "24 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "Alaska Statutes §34.03.070 - Security Deposits",
      "Alaska Statutes §34.03.100 - Landlord Obligations",
      "Alaska Statutes §34.03.140 - Right of Entry",
      "Alaska Statutes §34.03.220 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Charging deposits above 2 months' rent",
      "Failure to provide itemized deductions",
      "Entering without 24-hour notice",
      "Not maintaining heating (critical in Alaska)"
    ],
    resources: [
      {
        title: "Alaska Court System - Landlord-Tenant Information",
        url: "https://courts.alaska.gov/shc/landlord-tenant/index.htm"
      },
      {
        title: "Alaska Legal Services Corporation",
        url: "https://alsc-law.org/housing"
      }
    ]
  },
  vermont: {
    name: "Vermont",
    slug: "vermont",
    description: "Vermont has strong tenant protection laws with comprehensive regulations for security deposits, property maintenance, and lease procedures. The state provides detailed requirements for rental agreements and evictions.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "14 days after termination of tenancy. Must provide itemized statement of damages. If landlord fails to comply, tenant may recover deposit plus damages and attorney fees.",
    rentIncreaseNotice: "60 days notice required for month-to-month tenancies. Must follow lease terms for fixed-term leases.",
    entryNotice: "48 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "Vermont Statutes Title 9 §4461 - Security Deposits",
      "Vermont Statutes Title 9 §4457 - Landlord Obligations",
      "Vermont Statutes Title 9 §4460 - Right of Entry",
      "Vermont Statutes Title 9 §4467 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within 14 days",
      "Not providing 60-day notice for rent increases",
      "Failure to provide itemized deductions",
      "Entering without 48-hour notice",
      "Not maintaining habitability standards"
    ],
    resources: [
      {
        title: "Vermont Legal Aid - Housing",
        url: "https://www.vtlegalaid.org/housing"
      },
      {
        title: "Vermont Judiciary - Housing Resources",
        url: "https://www.vermontjudiciary.org/self-help/evictions-housing"
      }
    ]
  },
  wyoming: {
    name: "Wyoming",
    slug: "wyoming",
    description: "Wyoming has minimal statutory landlord-tenant regulations, with most rental terms governed by lease agreements and common law. The state provides basic protections but is generally considered landlord-friendly.",
    securityDepositLimit: "No statutory limit on security deposit amounts.",
    securityDepositReturn: "30 days after termination of tenancy, or within 15 days after receiving tenant's forwarding address. Must provide itemized statement of damages.",
    rentIncreaseNotice: "No statutory requirement, but reasonable notice is customary. Must follow lease terms.",
    entryNotice: "No statutory requirement, but reasonable notice is customary and should be specified in lease.",
    keyStatutes: [
      "Wyoming Statutes §1-21-1207 - Security Deposits",
      "Wyoming Statutes §1-21-1203 - Landlord Obligations",
      "Wyoming Statutes §1-21-1206 - Right of Entry",
      "Wyoming Statutes §1-21-1002 - Eviction Process"
    ],
    commonIssues: [
      "Not returning deposits within required timeframe",
      "Failure to provide itemized deductions",
      "Entering without reasonable notice",
      "Not maintaining habitability standards",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "Wyoming State Bar - Legal Resources",
        url: "https://www.wyomingbar.org/for-the-public/"
      },
      {
        title: "Legal Aid of Wyoming",
        url: "https://www.legalaidofwyoming.org/housing"
      }
    ]
  },
  "district-of-columbia": {
    name: "District of Columbia",
    slug: "district-of-columbia",
    description: "The District of Columbia has some of the strongest tenant protection laws in the nation with comprehensive rent control, strict security deposit regulations, and extensive habitability standards. DC provides robust protections for tenants.",
    securityDepositLimit: "1 month's rent for security deposits.",
    securityDepositReturn: "30 days after termination of tenancy. Must provide itemized statement of damages. Deposit must be held in interest-bearing escrow account and interest paid to tenant annually.",
    rentIncreaseNotice: "30 days notice required for month-to-month tenancies. Rent control applies to most buildings built before 1975. Increases limited to CPI.",
    entryNotice: "48 hours notice required for entry, except in emergencies.",
    keyStatutes: [
      "DC Code §42-3202.01 - Security Deposits",
      "DC Code §42-3501.01 - Rent Control",
      "DC Code §42-3505.51 - Landlord Obligations",
      "DC Code §16-1501 - Eviction Process"
    ],
    commonIssues: [
      "Not holding deposits in interest-bearing accounts",
      "Not paying annual interest to tenants",
      "Violating rent control regulations",
      "Not providing 48-hour notice for entry",
      "Improper eviction procedures"
    ],
    resources: [
      {
        title: "DC Office of the Tenant Advocate",
        url: "https://ota.dc.gov/"
      },
      {
        title: "DC Bar Pro Bono - Housing",
        url: "https://www.dcbar.org/pro-bono/housing"
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
