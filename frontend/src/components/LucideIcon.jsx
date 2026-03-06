import {
  Home, Salad, Dumbbell, Pill, Brain, Accessibility,
  Users, Calendar, AlarmClock, BookOpen, User,
  GlassWater, Scale, TrendingUp, HeartPulse, MessageCircle,
  CircleHelp, Settings, Bell, CircleCheck, CircleX,
  Volume2, Square, Lightbulb, ClipboardList, FileText,
  BarChart3, Stethoscope, Building2, Eye, EyeOff,
  Trash2, Pencil, Camera, Monitor, Laptop, Smartphone,
  Heart, Wrench, Hammer, AlertTriangle, Target,
  Smile, Meh, Frown, Angry,
  Sunrise, UtensilsCrossed, Cookie, Apple, Moon, Coffee,
  MapPin, Link, Lock, Key, Palette,
  Thermometer, Trophy, Sparkles, Rocket, Sprout,
  Compass, Music, Handshake, HeartHandshake, Shield, Info,
  Play, Search, Syringe, Microscope, Footprints,
  Activity, Keyboard, Mail, ChartLine, PenLine,
  BellOff, Droplet, FileDown, Upload, Briefcase,
  Folder, Star, Zap, PersonStanding, UserRound,
  ChevronDown, ChevronUp, ChevronRight, Plus, Minus,
  X, Check, ArrowLeft, ExternalLink, Copy,
  LayoutDashboard, Bed,
  LogOut, Circle, CalendarDays, Notebook, Hospital,
  Flame, Beef, Wheat, Phone, Paperclip, Type, Hash,
  RefreshCw, Clapperboard,
  List, ChefHat, Clock, Timer, Save, Send,
  ArrowRight, RotateCcw, Image, CookingPot
} from 'lucide-react';

// Bootstrap Icons fallback para iconos que no existen en Lucide
import {
  BsClock, BsListUl, BsImage, BsArrowRight,
  BsSave, BsSend, BsClockHistory,
  BsCalendar2Check, BsPersonBadge, BsHouseDoor,
  BsChatDots, BsGear, BsBell, BsBook,
  BsBarChart, BsFileEarmarkText, BsSearch,
  BsHeart, BsActivity, BsThermometer, BsTrophy,
  BsLightbulb, BsShield, BsStar, BsFolder,
  BsEye, BsEyeSlash, BsTrash, BsPencil,
  BsCamera, BsDisplay, BsLaptop, BsPhone,
  BsKey, BsLock, BsPalette, BsUpload, BsDownload,
  BsLink45Deg, BsExclamationTriangle, BsInfoCircle,
  BsCheckCircle, BsXCircle, BsChevronDown, BsChevronUp,
  BsChevronRight, BsPlus, BsDash, BsX, BsCheck,
  BsArrowLeft, BsBoxArrowUpRight, BsClipboard,
  BsPeople, BsPerson, BsCalendar, BsVolumeUp
} from 'react-icons/bs';

/**
 * LucideIcon - Componente centralizado de iconos para Azaria
 * Reemplaza todos los emojis del sistema con iconos Lucide consistentes
 * Uso: <LucideIcon name="calendar" size={20} />
 */

const ICON_MAP = {
  // --- Navegacion / General ---
  home: Home,
  calendar: Calendar,
  'alarm-clock': AlarmClock,
  message: MessageCircle,
  user: User,
  users: Users,
  settings: Settings,
  bell: Bell,
  'bell-off': BellOff,
  'book-open': BookOpen,
  'bar-chart': BarChart3,
  'chart-line': ChartLine,
  'trending-up': TrendingUp,
  clipboard: ClipboardList,
  'file-text': FileText,
  folder: Folder,
  search: Search,
  'layout-dashboard': LayoutDashboard,

  // --- Medico / Salud ---
  pill: Pill,
  brain: Brain,
  accessibility: Accessibility,
  'heart-pulse': HeartPulse,
  heart: Heart,
  stethoscope: Stethoscope,
  syringe: Syringe,
  microscope: Microscope,
  activity: Activity,
  thermometer: Thermometer,
  'briefcase-medical': Briefcase,
  hospital: Building2,
  bed: Bed,

  // --- Nutricion ---
  salad: Salad,
  'glass-water': GlassWater,
  droplet: Droplet,
  scale: Scale,
  utensils: UtensilsCrossed,
  apple: Apple,
  cookie: Cookie,
  sunrise: Sunrise,
  moon: Moon,
  coffee: Coffee,
  target: Target,

  // --- Ejercicio / Fitness ---
  dumbbell: Dumbbell,
  'person-standing': PersonStanding,
  footprints: Footprints,
  trophy: Trophy,
  zap: Zap,
  sprout: Sprout,
  rocket: Rocket,

  // --- Acciones ---
  pencil: Pencil,
  'pen-line': PenLine,
  trash: Trash2,
  camera: Camera,
  volume: Volume2,
  stop: Square,
  play: Play,
  plus: Plus,
  minus: Minus,
  eye: Eye,
  'eye-off': EyeOff,
  lock: Lock,
  key: Key,
  palette: Palette,
  upload: Upload,
  download: FileDown,
  link: Link,
  'external-link': ExternalLink,
  copy: Copy,
  'arrow-left': ArrowLeft,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-right': ChevronRight,
  x: X,
  check: Check,

  // --- Estado ---
  'circle-check': CircleCheck,
  'circle-x': CircleX,
  'alert-triangle': AlertTriangle,
  info: Info,
  'circle-help': CircleHelp,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  shield: Shield,
  star: Star,

  // --- Emociones (Neuropsicologia) ---
  smile: Smile,
  meh: Meh,
  frown: Frown,
  angry: Angry,

  // --- ACT / Mindfulness ---
  compass: Compass,
  music: Music,
  handshake: Handshake,
  'heart-handshake': HeartHandshake,

  // --- Dispositivos ---
  monitor: Monitor,
  laptop: Laptop,
  smartphone: Smartphone,
  keyboard: Keyboard,

  // --- Comunicacion ---
  mail: Mail,
  'map-pin': MapPin,
  'user-round': UserRound,

  // --- Wrench / Tools ---
  wrench: Wrench,
  hammer: Hammer,

  // --- Nutricion (macros) ---
  flame: Flame,
  beef: Beef,
  wheat: Wheat,

  // --- Comunicacion extra ---
  phone: Phone,
  paperclip: Paperclip,

  // --- Tipografia / UI ---
  type: Type,
  hash: Hash,
  'refresh-cw': RefreshCw,
  clapperboard: Clapperboard,

  // --- Extra ---
  logout: LogOut,
  circle: Circle,
  'calendar-days': CalendarDays,
  notebook: Notebook,
  'hospital-building': Hospital,

  // --- Agregados para Generador de Planes ---
  list: List,
  'chef-hat': ChefHat,
  clock: Clock,
  timer: Timer,
  save: Save,
  send: Send,
  'arrow-right': ArrowRight,
  'rotate-ccw': RotateCcw,
  image: Image,
  'cooking-pot': CookingPot,
};

// Mapa de fallback Bootstrap para iconos que no existan en Lucide
const BS_FALLBACK_MAP = {
  home: BsHouseDoor,
  calendar: BsCalendar,
  message: BsChatDots,
  user: BsPerson,
  users: BsPeople,
  settings: BsGear,
  bell: BsBell,
  'book-open': BsBook,
  'bar-chart': BsBarChart,
  'file-text': BsFileEarmarkText,
  search: BsSearch,
  heart: BsHeart,
  activity: BsActivity,
  thermometer: BsThermometer,
  trophy: BsTrophy,
  lightbulb: BsLightbulb,
  shield: BsShield,
  star: BsStar,
  folder: BsFolder,
  eye: BsEye,
  'eye-off': BsEyeSlash,
  trash: BsTrash,
  pencil: BsPencil,
  camera: BsCamera,
  monitor: BsDisplay,
  laptop: BsLaptop,
  smartphone: BsPhone,
  lock: BsLock,
  key: BsKey,
  palette: BsPalette,
  upload: BsUpload,
  download: BsDownload,
  link: BsLink45Deg,
  'alert-triangle': BsExclamationTriangle,
  info: BsInfoCircle,
  'circle-check': BsCheckCircle,
  'circle-x': BsXCircle,
  'chevron-down': BsChevronDown,
  'chevron-up': BsChevronUp,
  'chevron-right': BsChevronRight,
  plus: BsPlus,
  minus: BsDash,
  x: BsX,
  check: BsCheck,
  'arrow-left': BsArrowLeft,
  'external-link': BsBoxArrowUpRight,
  clipboard: BsClipboard,
  volume: BsVolumeUp,
  clock: BsClock,
  list: BsListUl,
  image: BsImage,
  'arrow-right': BsArrowRight,
  save: BsSave,
  send: BsSend,
  timer: BsClockHistory,
  'calendar-days': BsCalendar2Check,
  'person-standing': BsPersonBadge,
};

const LucideIcon = ({ name, size = 20, className = '', color, strokeWidth = 1.8, ...props }) => {
  // Primero intentar Lucide
  const IconComponent = ICON_MAP[name];
  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        className={`lucide-icon ${className}`}
        color={color}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  // Fallback: Bootstrap Icon
  const BsIcon = BS_FALLBACK_MAP[name];
  if (BsIcon) {
    return (
      <BsIcon
        size={size}
        className={`lucide-icon bs-fallback ${className}`}
        color={color}
        style={{ verticalAlign: 'middle' }}
        {...props}
      />
    );
  }

  // Último recurso: icono genérico
  return (
    <BsInfoCircle
      size={size}
      className={`lucide-icon bs-fallback ${className}`}
      color={color || 'currentColor'}
      style={{ verticalAlign: 'middle', opacity: 0.5 }}
    />
  );
};

export default LucideIcon;
