import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Import des icônes solides (solid)
import { 
  // Icônes de navigation
  faHome,
  faBars,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faEllipsisV,
  faArrowRight,
  faSearch,
  faFilter,
  faPlus,
  faTimes,
  
  // Icônes d'utilisateur
  faUser,
  faUserTie,
  faUserShield,
  faUserTag,
  faUserPlus,
  
  // Icônes de propriétés
  faBuilding,
  faMapMarkerAlt,
  faFileContract,
  faMoneyBillWave,
  faReceipt,
  faCreditCard,
  faFileExport,
  
  // Icônes d'interface
  faCog,
  faUsers,
  faChartBar,
  faChartLine,
  faChartPie,
  faTools,
  faCalendarCheck,
  faEnvelope,
  faPercentage,
  faFolder,
  faPlusCircle,
  faSignOutAlt,
  faBell,
  faEdit,
  faTrash,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faPhone,
  faClock,
  
  // Icônes spécifiques
  faEye,
  faFlag,
  faSlidersH,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

// Import des icônes régulières (regular)
import { 
  faCheckCircle as farCheckCircle
} from '@fortawesome/free-regular-svg-icons';

// Import des icônes de marques (réseaux sociaux)
import { 
  faGithub,
  faLinkedin,
  faTwitter,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';

// Ajouter les icônes à la bibliothèque
library.add(
  // Icônes régulières
  farCheckCircle,
  
  // Icônes solides
  faHome,
  faUser,
  faCog,
  faBuilding,
  faFileContract,
  faCreditCard,
  faUsers,
  faUserTie,
  faUserShield,
  faUserTag,
  faReceipt,
  faChartBar,
  faChartLine,
  faChartPie,
  faTools,
  faCalendarCheck,
  faEnvelope,
  faPercentage,
  faFolder,
  faPlusCircle,
  faMoneyBillWave,
  faSignOutAlt,
  faBars,
  faChevronLeft,
  faBell,
  faEllipsisV,
  faChevronDown,
  faChevronRight,
  faArrowRight,
  faSearch,
  faFilter,
  faTimes,
  faEdit,
  faTrash,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  // Nouvelles icônes solid
  faPhone,
  faMapMarkerAlt,
  faClock,
  faEye,
  faUserPlus,
  faFileExport,
  faExclamationCircle,
  faCheckCircle,
  // Icônes de marques
  faGithub,
  faLinkedin,
  faTwitter,
  faFacebook,
  faInstagram
);

export { FontAwesomeIcon };