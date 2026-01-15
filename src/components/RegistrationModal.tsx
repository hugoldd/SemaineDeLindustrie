import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Download, FileText } from 'lucide-react';
import type { UiVisit, UiCompany } from '../lib/data/companies';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: UiVisit;
  company: UiCompany;
}

type Step = 1 | 2 | 3;
type RegistrationType = 'individual' | 'group';

export function RegistrationModal({ isOpen, onClose, visit, company }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('individual');
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    school: '',
    level: '',
    studentCount: '',
    teacherName: '',
    teacherEmail: '',
    teacherPhone: '',
    specialNeeds: '',
    parentalAuth: false,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
      if (!formData.email.trim()) newErrors.email = 'Email requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
      if (!formData.school.trim()) newErrors.school = 'Établissement requis';
      if (!formData.level) newErrors.level = 'Niveau requis';
    }

    if (step === 2 && registrationType === 'group') {
      if (!formData.studentCount || parseInt(formData.studentCount) < 1) {
        newErrors.studentCount = 'Nombre d\'élèves requis';
      }
      if (!formData.teacherName.trim()) newErrors.teacherName = 'Nom enseignant requis';
      if (!formData.teacherEmail.trim()) newErrors.teacherEmail = 'Email enseignant requis';
      if (!formData.teacherPhone.trim()) newErrors.teacherPhone = 'Téléphone enseignant requis';
    }

    if (step === 3) {
      if (!formData.parentalAuth) newErrors.parentalAuth = 'Autorisation parentale requise';
      if (!formData.termsAccepted) newErrors.termsAccepted = 'Acceptation des CGU requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && registrationType === 'individual') {
        setCurrentStep(3);
      } else if (currentStep < 3) {
        setCurrentStep((currentStep + 1) as Step);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 3 && registrationType === 'individual') {
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      // Submit logic here
      alert('Inscription confirmée !');
      onClose();
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-[#2D3748]">
            Inscription à la visite
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 bg-[#F7FAFC]">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => {
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              const shouldShow = !(step === 2 && registrationType === 'individual');

              if (!shouldShow) return null;

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        isCompleted
                          ? 'bg-[#34A853] text-white'
                          : isActive
                          ? 'bg-[#FF6B35] text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className="text-xs mt-2 text-center hidden sm:block">
                      {step === 1 ? 'Informations' : step === 2 ? 'Participants' : 'Confirmation'}
                    </span>
                  </div>
                  {step < 3 && shouldShow && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        currentStep > step ? 'bg-[#34A853]' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-3">
                  Type d'inscription
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-[#F7FAFC] transition-colors">
                    <input
                      type="radio"
                      name="registrationType"
                      value="individual"
                      checked={registrationType === 'individual'}
                      onChange={(e) => setRegistrationType(e.target.value as RegistrationType)}
                      className="w-5 h-5 text-[#FF6B35]"
                    />
                    <div>
                      <div className="font-medium text-[#2D3748]">Inscription individuelle</div>
                      <div className="text-sm text-gray-600">Je m'inscris seul(e)</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-[#F7FAFC] transition-colors">
                    <input
                      type="radio"
                      name="registrationType"
                      value="group"
                      checked={registrationType === 'group'}
                      onChange={(e) => setRegistrationType(e.target.value as RegistrationType)}
                      className="w-5 h-5 text-[#FF6B35]"
                    />
                    <div>
                      <div className="font-medium text-[#2D3748]">Groupe classe</div>
                      <div className="text-sm text-gray-600">Inscription pour une classe entière</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="votre.email@exemple.fr"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="06 12 34 56 78"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2">
                  Établissement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => updateFormData('school', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                    errors.school ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom de votre lycée"
                />
                {errors.school && (
                  <p className="text-red-500 text-sm mt-1">{errors.school}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2">
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => updateFormData('level', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                    errors.level ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="seconde">Seconde</option>
                  <option value="premiere">Première</option>
                  <option value="terminale">Terminale</option>
                </select>
                {errors.level && (
                  <p className="text-red-500 text-sm mt-1">{errors.level}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Group Information */}
          {currentStep === 2 && registrationType === 'group' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2">
                  Nombre d'élèves <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.studentCount}
                  onChange={(e) => updateFormData('studentCount', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                    errors.studentCount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 25"
                />
                {errors.studentCount && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentCount}</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-[#2D3748] mb-4">
                  Enseignant responsable
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.teacherName}
                      onChange={(e) => updateFormData('teacherName', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                        errors.teacherName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Prénom et nom de l'enseignant"
                    />
                    {errors.teacherName && (
                      <p className="text-red-500 text-sm mt-1">{errors.teacherName}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3748] mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.teacherEmail}
                        onChange={(e) => updateFormData('teacherEmail', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                          errors.teacherEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="email@lycee.fr"
                      />
                      {errors.teacherEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.teacherEmail}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2D3748] mb-2">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.teacherPhone}
                        onChange={(e) => updateFormData('teacherPhone', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                          errors.teacherPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="06 12 34 56 78"
                      />
                      {errors.teacherPhone && (
                        <p className="text-red-500 text-sm mt-1">{errors.teacherPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2">
                  Besoins spécifiques (optionnel)
                </label>
                <textarea
                  value={formData.specialNeeds}
                  onChange={(e) => updateFormData('specialNeeds', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  placeholder="Allergies, accessibilité PMR, régimes alimentaires..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-[#F7FAFC] rounded-lg p-6">
                <h3 className="font-semibold text-[#2D3748] mb-4">Récapitulatif</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entreprise:</span>
                    <span className="font-medium text-[#2D3748]">{company.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-[#2D3748]">{formatDate(visit.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horaire:</span>
                    <span className="font-medium text-[#2D3748]">{visit.time} ({visit.duration} min)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-[#2D3748]">{visit.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inscription:</span>
                    <span className="font-medium text-[#2D3748]">
                      {registrationType === 'individual' ? 'Individuelle' : `Groupe de ${formData.studentCount} élèves`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium text-[#2D3748]">{formData.firstName} {formData.lastName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`border-2 rounded-lg p-4 ${errors.parentalAuth ? 'border-red-500' : 'border-gray-200'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.parentalAuth}
                      onChange={(e) => updateFormData('parentalAuth', e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-[#FF6B35] rounded"
                    />
                    <div className="flex-1">
                      <span className="text-[#2D3748]">
                        J'ai l'autorisation parentale nécessaire <span className="text-red-500">*</span>
                      </span>
                      <div className="mt-2">
                        <a
                          href="#"
                          className="inline-flex items-center gap-2 text-sm text-[#2C5F8D] hover:text-[#1e4161]"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger le formulaire d'autorisation
                        </a>
                      </div>
                    </div>
                  </label>
                  {errors.parentalAuth && (
                    <p className="text-red-500 text-sm mt-2">{errors.parentalAuth}</p>
                  )}
                </div>

                <div className={`border-2 rounded-lg p-4 ${errors.termsAccepted ? 'border-red-500' : 'border-gray-200'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-[#FF6B35] rounded"
                    />
                    <div className="flex-1">
                      <span className="text-[#2D3748]">
                        J'accepte les{' '}
                        <a href="#" className="text-[#2C5F8D] hover:underline">
                          conditions générales d'utilisation
                        </a>{' '}
                        <span className="text-red-500">*</span>
                      </span>
                    </div>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-red-500 text-sm mt-2">{errors.termsAccepted}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Information importante</p>
                  <p>
                    Vous recevrez un email de confirmation avec toutes les informations pratiques 
                    et un QR code d'accès à présenter le jour de la visite.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-[#F7FAFC]">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2.5 text-[#2D3748] hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>

          {currentStep < 3 || (currentStep === 1 && registrationType === 'individual') ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A2A] transition-colors"
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#34A853] text-white rounded-lg hover:bg-[#2d8e45] transition-colors"
            >
              <Check className="w-5 h-5" />
              Confirmer l'inscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
