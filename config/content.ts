/**
 * Centralized Content Configuration
 * 
 * All page content is defined here. This allows for:
 * - Easy content updates without touching components
 * - Future CMS integration
 * - Multi-language support (can be extended)
 * - SEO metadata management
 */

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  twitterCard?: 'summary' | 'summary_large_image'
  canonicalUrl?: string
}

export interface HeroSection {
  title: string
  subtitle?: string
  description?: string
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  image?: string
  backgroundImage?: string
  searchPlaceholder?: string
  searchButtonText?: string
  socialProof?: string
}

export interface Feature {
  title: string
  description: string
  icon?: string
  image?: string
}

export interface CTASection {
  title: string
  description: string
  primaryButton: {
    text: string
    href: string
  }
  secondaryButton?: {
    text: string
    href: string
  }
}

export interface FAQItem {
  question: string
  answer: string
}

export interface Testimonial {
  name: string
  role?: string
  content: string
  rating?: number
  image?: string
}

export interface PageContent {
  seo: SEOConfig
  hero?: HeroSection
  features?: Feature[]
  cta?: CTASection
  faq?: FAQItem[]
  testimonials?: Testimonial[]
  /** Optional subtitle shown above the testimonials grid (e.g. social proof line). */
  testimonialsSubtitle?: string
  content?: {
    sections?: Array<{
      title?: string
      content: string
      type?: 'text' | 'image' | 'video' | 'grid'
    }>
  }
}

// Page Content Definitions
export const pageContent: Record<string, PageContent> = {
  home: {
    seo: {
      title: 'Renting the way it should be | Rent Setu',
      description: 'Find your perfect rental property or advertise your property. No admin fees, transparent pricing, and trusted by thousands of tenants and landlords.',
      keywords: ['rental', 'property', 'tenants', 'landlords', 'rent', 'India property'],
      ogTitle: 'Renting the way it should be',
      ogDescription: 'The destination for finding, advertising, and managing rental property',
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
    hero: {
      title: 'Renting the way it should be',
      description: 'The destination for finding, advertising, and managing rental property',
      searchPlaceholder: 'Enter a location to search',
      searchButtonText: 'Search',
      socialProof: '1 Lakh+ Tenants and Landlords',
      backgroundImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1560&q=80',
    },
    features: [
      {
        title: 'For Landlords',
        description: 'Advertise your rental property. We find you tenants and help with referencing, contracts and more if you need it.',
        icon: '🏠',
      },
      {
        title: 'For Tenants',
        description: 'On our platform there are never any admin fees. Ever. We take down listings as soon as they are let, so no more ghost adverts.',
        icon: '🔑',
      },
      {
        title: 'Trusted Platform',
        description: 'We protect your deposit and rent money. The safer, faster and cheaper way to rent.',
        icon: '🛡️',
      },
    ],
    cta: {
      title: 'Ready to get started?',
      description: 'Join thousands of happy tenants and landlords',
      primaryButton: {
        text: 'Get Started',
        href: '/signup',
      },
      secondaryButton: {
        text: 'Learn More',
        href: '/about',
      },
    },
    testimonialsSubtitle: '1 Lakh+ Tenants and Landlords · Happy tenants and landlords',
    testimonials: [
      {
        name: 'Rahul',
        content: 'Happy to recommend - smart and seamless service.',
        rating: 5,
      },
      {
        name: 'Vinod',
        content: 'Got a contract signed and deposit sorted within 24 hours of listing.',
        rating: 5,
      },
      {
        name: 'Devashish',
        content: 'Rented out my house in a week! The reference service brings peace of mind.',
        rating: 5,
      },
      {
        name: 'Pooja',
        content: 'Easy and efficient service with great reach. Found my ideal tenant quickly.',
        rating: 5,
      },
    ],
  },
  'what-we-are': {
    seo: {
      title: 'What We Are | About Our Platform',
      description: 'Learn about our mission to revolutionize the rental market with transparency, fairness, and innovation.',
      keywords: ['about', 'mission', 'values', 'rental platform'],
      ogTitle: 'What We Are',
      ogType: 'website',
    },
    hero: {
      title: 'What We Are',
      subtitle: 'Transforming the rental experience',
      description: 'We are a modern rental platform dedicated to making property rental fair, transparent, and accessible for everyone.',
    },
    content: {
      sections: [
        {
          type: 'text',
          title: 'Our Mission',
          content: 'To revolutionize the rental market by removing barriers, reducing costs, and creating a platform where tenants and landlords can connect directly with trust and transparency.',
        },
        {
          type: 'text',
          title: 'Our Values',
          content: 'Transparency, fairness, and innovation drive everything we do. We believe renting should be simple, affordable, and stress-free for everyone involved.',
        },
      ],
    },
  },
  'what-we-do': {
    seo: {
      title: 'What We Do | Our Services',
      description: 'Discover how we help tenants find their perfect home and landlords manage their properties efficiently.',
      keywords: ['services', 'features', 'property management', 'tenant services'],
      ogTitle: 'What We Do',
      ogType: 'website',
    },
    hero: {
      title: 'What We Do',
      subtitle: 'Comprehensive rental solutions',
      description: 'From property advertising to tenant referencing, we provide all the tools you need for successful property rentals.',
    },
    features: [
      {
        title: 'Property Advertising',
        description: 'List your property on major portals including Rightmove and OnTheMarket.',
      },
      {
        title: 'Tenant Referencing',
        description: 'Comprehensive background checks to ensure reliable tenants.',
      },
      {
        title: 'Tenancy Creation',
        description: 'Legally compliant contracts and documentation.',
      },
      {
        title: 'Rent Collection',
        description: 'Automated rent collection with full transparency.',
      },
      {
        title: 'Property Management',
        description: 'End-to-end property management services.',
      },
      {
        title: 'Legal Support',
        description: 'Expert legal advice and support when you need it.',
      },
    ],
  },
  'about-tenants': {
    seo: {
      title: 'For Tenants | Find Your Perfect Rental',
      description: 'Search thousands of rental properties with no admin fees. Protected deposits and transparent pricing.',
      keywords: ['tenants', 'rental properties', 'no fees', 'property search'],
      ogTitle: 'For Tenants',
      ogType: 'website',
    },
    hero: {
      title: 'For Tenants',
      subtitle: 'Find Your Next Home',
      description: 'On our platform there are never any admin fees. Ever. We take down listings as soon as they are let, so no more ghost adverts. And we\'ll protect your deposit and rent money.',
      primaryCTA: {
        text: 'Search Properties',
        href: '/search',
      },
    },
    features: [
      {
        title: 'No Admin Fees',
        description: 'Never pay admin fees. What you see is what you pay.',
      },
      {
        title: 'No Dead Listings',
        description: 'We remove listings as soon as they\'re let, so you only see available properties.',
      },
      {
        title: 'Protected Deposits',
        description: 'Your deposit and rent money are protected and secure.',
      },
    ],
    faq: [
      {
        question: 'Are there any fees for tenants?',
        answer: 'No, we never charge admin fees to tenants. The price you see is the price you pay.',
      },
      {
        question: 'How do I search for properties?',
        answer: 'Use our search tool to filter by location, price, property type, and more.',
      },
      {
        question: 'How are deposits protected?',
        answer: 'All deposits are held in a protected scheme, ensuring your money is safe.',
      },
    ],
  },
  'about-landlords': {
    seo: {
      title: 'For Landlords | Advertise Your Property',
      description: 'Advertise your rental property and find tenants quickly. We help with referencing, contracts, and more.',
      keywords: ['landlords', 'property advertising', 'tenant finding', 'property management'],
      ogTitle: 'For Landlords',
      ogType: 'website',
    },
    hero: {
      title: 'For Landlords',
      subtitle: 'Advertise Your Rental Property',
      description: 'We find you tenants and help with referencing, contracts and more if you need it. You stay in control.',
      primaryCTA: {
        text: 'Start Advertising',
        href: '/landlords/add-listing',
      },
    },
    features: [
      {
        title: '100% Free Advertising Option',
        description: 'List your property for free with no hidden fees.',
      },
      {
        title: 'No Hidden Fees',
        description: 'Transparent pricing with no surprises.',
      },
      {
        title: 'No Renewal Fees',
        description: 'Keep your listing active without renewal charges.',
      },
      {
        title: 'Major Portal Advertising',
        description: 'We advertise on Rightmove, OnTheMarket and many more.',
      },
    ],
    faq: [
      {
        question: 'How much does it cost to list a property?',
        answer: 'We offer a 100% free advertising option with no hidden fees.',
      },
      {
        question: 'Where will my property be advertised?',
        answer: 'Your property will be listed on Rightmove, OnTheMarket, and our own platform.',
      },
      {
        question: 'What services do you provide?',
        answer: 'We offer tenant referencing, contract creation, rent collection, and full property management services.',
      },
    ],
  },
  'help-center': {
    seo: {
      title: 'Help Center | Support & FAQs',
      description: 'Find answers to common questions and get help with using our platform.',
      keywords: ['help', 'support', 'FAQ', 'customer service'],
      ogTitle: 'Help Center',
      ogType: 'website',
    },
    hero: {
      title: 'Help Center',
      subtitle: 'How can we help you?',
      description: 'Find answers to common questions or contact our support team.',
    },
    faq: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top right corner and follow the registration process.',
      },
      {
        question: 'How do I list my property?',
        answer: 'After creating an account, go to "Add Listing" and fill in your property details.',
      },
      {
        question: 'How do I search for properties?',
        answer: 'Use the search bar on the homepage or browse by location using our property search tool.',
      },
      {
        question: 'Are there fees for tenants?',
        answer: 'No, we never charge admin fees to tenants.',
      },
      {
        question: 'How are deposits protected?',
        answer: 'All deposits are held in government-approved deposit protection schemes.',
      },
      {
        question: 'Can I contact landlords directly?',
        answer: 'Yes, once you create an account, you can message landlords directly through our platform.',
      },
    ],
  },
  contact: {
    seo: {
      title: 'Contact Us | Get in Touch',
      description: 'Get in touch with our team. We\'re here to help with any questions or concerns.',
      keywords: ['contact', 'support', 'customer service'],
      ogTitle: 'Contact Us',
      ogType: 'website',
    },
    hero: {
      title: 'Contact Us',
      subtitle: 'We\'re here to help',
      description: 'Have a question or need assistance? Get in touch with our team.',
    },
    content: {
      sections: [
        {
          type: 'text',
          title: 'Get in Touch',
          content: 'You can reach us via email, phone, or through our contact form. Our support team is available to help with any questions or concerns.',
        },
      ],
    },
  },
  'privacy-policy': {
    seo: {
      title: 'Privacy Policy | Your Data Protection',
      description: 'Learn how we collect, use, and protect your personal information.',
      keywords: ['privacy', 'data protection', 'GDPR', 'privacy policy'],
      ogTitle: 'Privacy Policy',
      ogType: 'website',
    },
    hero: {
      title: 'Privacy Policy',
      subtitle: 'Your privacy matters',
      description: 'We are committed to protecting your personal information and being transparent about how we use it.',
    },
    content: {
      sections: [
        {
          type: 'text',
          title: 'Information We Collect',
          content: 'We collect information that you provide directly to us, such as when you create an account, list a property, or contact us. This may include your name, email address, phone number, and property details.',
        },
        {
          type: 'text',
          title: 'How We Use Your Information',
          content: 'We use your information to provide our services, communicate with you, and improve our platform. We do not sell your personal information to third parties.',
        },
        {
          type: 'text',
          title: 'Data Security',
          content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
        },
        {
          type: 'text',
          title: 'Your Rights',
          content: 'You have the right to access, correct, or delete your personal information at any time. You can also object to processing or request data portability.',
        },
      ],
    },
  },
  terms: {
    seo: {
      title: 'Terms & Conditions | Legal Terms',
      description: 'Read our terms and conditions for using our rental platform.',
      keywords: ['terms', 'conditions', 'legal', 'terms of service'],
      ogTitle: 'Terms & Conditions',
      ogType: 'website',
    },
    hero: {
      title: 'Terms & Conditions',
      subtitle: 'Legal terms of service',
      description: 'Please read these terms carefully before using our platform.',
    },
    content: {
      sections: [
        {
          type: 'text',
          title: 'Acceptance of Terms',
          content: 'By accessing and using this platform, you accept and agree to be bound by these terms and conditions.',
        },
        {
          type: 'text',
          title: 'Use of the Platform',
          content: 'You agree to use the platform only for lawful purposes and in accordance with these terms. You must not use the platform in any way that could damage, disable, or impair the platform.',
        },
        {
          type: 'text',
          title: 'User Accounts',
          content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
        },
        {
          type: 'text',
          title: 'Property Listings',
          content: 'Landlords are responsible for the accuracy of property listings and must ensure all information is correct and up to date.',
        },
        {
          type: 'text',
          title: 'Limitation of Liability',
          content: 'We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
        },
      ],
    },
  },
}

/**
 * Get content for a specific page
 */
export function getPageContent(pageKey: string): PageContent | null {
  return pageContent[pageKey] || null
}

/**
 * Get SEO config for a specific page
 */
export function getSEOConfig(pageKey: string): SEOConfig | null {
  const content = getPageContent(pageKey)
  return content?.seo || null
}
