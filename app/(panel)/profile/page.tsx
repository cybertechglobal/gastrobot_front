// app/profile/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import {
  Camera,
  Save,
  X,
  Phone,
  Mail,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import {
  updateUser,
  updateUserImage,
  updateUserPassword,
} from '@/lib/api/users';
import { updateSession } from '@/actions/action';
import { toast } from 'sonner';

interface UpdateProfileData {
  firstname: string;
  lastname: string;
  phoneNumber: string;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

function initialsFrom(
  firstname?: string | null,
  lastname?: string | null,
  fallbackName?: string | null
) {
  const a = (firstname || '').trim();
  const b = (lastname || '').trim();
  if (a || b) return `${a?.[0] ?? ''}${b?.[0] ?? ''}`.toUpperCase() || 'U';
  const n = (fallbackName || '').trim();
  if (n) {
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (n[0] || 'U').toUpperCase();
  }
  return 'U';
}

export default function ProfilePage() {
  const { data: session, update: refreshSession } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const userData = session?.user;

  // Form state
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstname: '',
    lastname: '',
    phoneNumber: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    oldPassword: '',
    newPassword: '',
  });

  // Upload profile image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      return updateUserImage(formData);
    },
    onSuccess: async (data) => {
      await updateSession({
        user: {
          ...session?.user,
          profileImageUrl: data.profileImageUrl || data.image,
        },
      });

      await refreshSession();
      setImagePreview(null);
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!session?.user?.id) throw new Error('User ID is missing');

      return updateUser(session?.user.id, data);
    },
    onSuccess: async (updatedUser) => {
      await updateSession({
        user: {
          ...session?.user,
          firstname: updatedUser.firstname,
          lastname: updatedUser.lastname,
          phoneNumber: updatedUser.phoneNumber,
        },
      });

      await refreshSession();
      setIsEditing(false);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
      toast.success('Lozinka je uspešno promenjena!');
    },
    onError: (error: Error) => {
      alert(error.message || 'Greška pri promeni lozinke');
    },
  });

  // Initialize form when editing starts
  const handleEditClick = () => {
    setFormData({
      firstname: userData?.firstname || '',
      lastname: userData?.lastname || '',
      phoneNumber: userData?.phoneNumber || '',
    });
    setIsEditing(true);
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      uploadImageMutation.mutate(file);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Handle password change submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    changePasswordMutation.mutate(passwordData);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setImagePreview(null);
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordData({ oldPassword: '', newPassword: '' });
  };

  const displayImage = imagePreview || userData?.profileImageUrl;
  const initials = initialsFrom(
    userData?.firstname,
    userData?.lastname,
    userData?.name
  );

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-1 pb-10">
            {/* Profile Image Section */}
            <div className="relative mb-6">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      width={112}
                      height={112}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary">
                      <span className="text-white text-3xl font-semibold select-none">
                        {initials}
                      </span>
                    </div>
                  )}
                </div>

                <Label className="absolute bottom-0 right-0 bg-white text-white rounded-full p-2 cursor-pointer shadow-lg transition-all hover:scale-110">
                  {uploadImageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary" />
                  )}
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadImageMutation.isPending}
                  />
                </Label>
              </div>
            </div>

            {/* Form */}
            <div onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ime
                    </Label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.firstname}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstname: e.target.value,
                          })
                        }
                        className="w-full"
                        placeholder="Unesite ime"
                      />
                    ) : (
                      <div className="h-[36px] flex items-center px-4 py-3 bg-slate-50 rounded-lg text-slate-900 font-medium">
                        {userData?.firstname || '-'}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      Prezime
                    </Label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.lastname}
                        onChange={(e) =>
                          setFormData({ ...formData, lastname: e.target.value })
                        }
                        className="w-full"
                        placeholder="Unesite prezime"
                      />
                    ) : (
                      <div className="h-[36px] flex items-center px-4 py-3 bg-slate-50 rounded-lg text-slate-900 font-medium">
                        {userData?.lastname || '-'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <div className="h-[36px] px-4 py-3 bg-slate-50 rounded-lg text-slate-600 flex items-center">
                    {session?.user?.email || '-'}
                    <span className="ml-auto text-xs text-slate-400">
                      Nije moguće menjati
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Broj telefona
                  </Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="+381 64 123 4567"
                    />
                  ) : (
                    <div className="h-[36px] flex items-center px-4 py-3 bg-slate-50 rounded-lg text-slate-900 font-medium">
                      {userData?.phoneNumber || '-'}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSubmit}
                      disabled={updateMutation.isPending}
                      className="flex-1"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Čuvanje...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Sačuvaj izmene
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      <X className="w-5 h-5" />
                      Otkaži
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEditClick} className="w-full">
                    Izmeni profil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-1 pb-10">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-semibold text-slate-900">
                Sigurnost
              </h2>
            </div>

            {!isChangingPassword ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                className="w-full"
              >
                Promeni lozinku
              </Button>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  {/* Old Password */}
                  <div>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      Stara lozinka
                    </Label>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordData.oldPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            oldPassword: e.target.value,
                          })
                        }
                        className="w-full pr-10"
                        placeholder="Unesite staru lozinku"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showOldPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nova lozinka
                    </Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full pr-10"
                        placeholder="Unesite novu lozinku"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Minimalno 6 karaktera
                    </p>
                  </div>
                </div>

                {/* Password Action Buttons */}
                <div className="mt-8 flex gap-4">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex-1"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Čuvanje...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Promeni lozinku
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePasswordCancel}
                    className="flex-1"
                  >
                    <X className="w-5 h-5" />
                    Otkaži
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
