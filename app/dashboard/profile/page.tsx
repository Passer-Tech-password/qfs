"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, ArrowLeft, LogOut, Check, Shield, CheckCircle2, AlertCircle, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, updateProfile } from "firebase/auth";
import { getFirebaseClients } from "@/lib/firebase/client";
import { useAuth } from "@/lib/hooks/use-auth";

const darkField =
  "w-full rounded-xl border border-slate-700 bg-[#1e2235] px-4 py-3 text-[13.5px] text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-500";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Uploads a single profile image to Cloudinary via an unsigned upload preset.
async function uploadProfileImage(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Image upload is not configured. Add the NEXT_PUBLIC_CLOUDINARY_* values to .env.local and restart the app.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error("Upload failed. Please try a different image.");
  }

  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Upload did not return an image URL. Please try again.");
  }

  return data.secure_url;
}

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username] = useState("Cristiana456");
  const [email] = useState("Cristianalaww456@gmail.com");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "signed-in") {
      setAvatarUrl(auth.user.photoURL ?? null);
    }
  }, [auth]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      const { auth } = getFirebaseClients();
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Unable to sign out. Please try again.",
      );
      setSigningOut(false);
    }
  }

  function handleChangePicture() {
    if (uploading) return;
    fileInputRef.current?.click();
  }


  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploadError(null);

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Please choose a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be 5 MB or smaller.");
      return;
    }

    const { auth: firebaseAuth } = getFirebaseClients();
    const user = firebaseAuth.currentUser;

    if (!user) {
      setUploadError("Please sign in again.");
      return;
    }

    setUploading(true);

    try {
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Image upload failed.");
      }

      await updateProfile(user, {
        photoURL: result.photoURL,
      });

      setAvatarUrl(result.photoURL);

    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }


  function handleSaveChanges() {
    if (!fullName.trim()) {
      setSaved(false);
      setSaveError("Please enter your full legal name before saving.");
      return;
    }
    setSaveError(null);
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Profile Settings
          </span>
          <h2 className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">
            Account Profile
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage your personal details, contact info, and profile picture.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </div>

      <div className="dash-card mt-6 p-6">
        {/* Profile Picture */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile picture"
                  className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-400">
                  No Photo
                </div>
              )}
              <button
                type="button"
                onClick={handleChangePicture}
                disabled={uploading}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-2 ring-white disabled:cursor-wait disabled:opacity-70"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900">{username}</p>
              <p className="text-[12px] text-slate-500">Member since November 2026</p>
              <p className="mt-1 text-[11.5px] text-slate-400">
                {uploading ? "Uploading image…" : "Click camera badge to change picture"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-[12px] font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-wait disabled:opacity-70"
          >
            <LogOut size={14} />
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
        {signOutError && (
          <p role="alert" className="mt-3 text-[12px] font-medium text-rose-600">
            {signOutError}
          </p>
        )}
        {uploadError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <p className="text-[12.5px] font-medium text-rose-700">{uploadError}</p>
          </div>
        )}

        {/* Personal Information */}
        <h3 className="mt-7 text-[15px] font-bold text-slate-900">Personal Information</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Username
            </label>
            <input
              type="text"
              value={username}
              readOnly
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Full Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full legal name"
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`${darkField} appearance-none pr-10`}
            >
              <option value="" className="text-slate-900">
                Select Country
              </option>
              <option value="AF" className="text-slate-900">
                Afghanistan
              </option>
              <option value="AX" className="text-slate-900">
                Åland Islands
              </option>
              <option value="AL" className="text-slate-900">
                Albania
              </option>
              <option value="DZ" className="text-slate-900">
                Algeria
              </option>
              <option value="AS" className="text-slate-900">
                American Samoa
              </option>
              <option value="AD" className="text-slate-900">
                Andorra
              </option>
              <option value="AO" className="text-slate-900">
                Angola
              </option>
              <option value="AI" className="text-slate-900">
                Anguilla
              </option>
              <option value="AQ" className="text-slate-900">
                Antarctica
              </option>
              <option value="AG" className="text-slate-900">
                Antigua and Barbuda
              </option>
              <option value="AR" className="text-slate-900">
                Argentina
              </option>
              <option value="AM" className="text-slate-900">
                Armenia
              </option>
              <option value="AW" className="text-slate-900">
                Aruba
              </option>
              <option value="AU" className="text-slate-900">
                Australia
              </option>
              <option value="AT" className="text-slate-900">
                Austria
              </option>
              <option value="AZ" className="text-slate-900">
                Azerbaijan
              </option>
              <option value="BS" className="text-slate-900">
                Bahamas
              </option>
              <option value="BH" className="text-slate-900">
                Bahrain
              </option>
              <option value="BD" className="text-slate-900">
                Bangladesh
              </option>
              <option value="BB" className="text-slate-900">
                Barbados
              </option>
              <option value="BY" className="text-slate-900">
                Belarus
              </option>
              <option value="BE" className="text-slate-900">
                Belgium
              </option>
              <option value="BZ" className="text-slate-900">
                Belize
              </option>
              <option value="BJ" className="text-slate-900">
                Benin
              </option>
              <option value="BM" className="text-slate-900">
                Bermuda
              </option>
              <option value="BT" className="text-slate-900">
                Bhutan
              </option>
              <option value="BO" className="text-slate-900">
                Bolivia
              </option>
              <option value="BQ" className="text-slate-900">
                Bonaire, Sint Eustatius and Saba
              </option>
              <option value="BA" className="text-slate-900">
                Bosnia and Herzegovina
              </option>
              <option value="BW" className="text-slate-900">
                Botswana
              </option>
              <option value="BV" className="text-slate-900">
                Bouvet Island
              </option>
              <option value="BR" className="text-slate-900">
                Brazil
              </option>
              <option value="IO" className="text-slate-900">
                British Indian Ocean Territory
              </option>
              <option value="BN" className="text-slate-900">
                Brunei Darussalam
              </option>
              <option value="BG" className="text-slate-900">
                Bulgaria
              </option>
              <option value="BF" className="text-slate-900">
                Burkina Faso
              </option>
              <option value="BI" className="text-slate-900">
                Burundi
              </option>
              <option value="CV" className="text-slate-900">
                Cabo Verde
              </option>
              <option value="KH" className="text-slate-900">
                Cambodia
              </option>
              <option value="CM" className="text-slate-900">
                Cameroon
              </option>
              <option value="CA" className="text-slate-900">
                Canada
              </option>
              <option value="KY" className="text-slate-900">
                Cayman Islands
              </option>
              <option value="CF" className="text-slate-900">
                Central African Republic
              </option>
              <option value="TD" className="text-slate-900">
                Chad
              </option>
              <option value="CL" className="text-slate-900">
                Chile
              </option>
              <option value="CN" className="text-slate-900">
                China
              </option>
              <option value="CX" className="text-slate-900">
                Christmas Island
              </option>
              <option value="CC" className="text-slate-900">
                Cocos (Keeling) Islands
              </option>
              <option value="CO" className="text-slate-900">
                Colombia
              </option>
              <option value="KM" className="text-slate-900">
                Comoros
              </option>
              <option value="CG" className="text-slate-900">
                Congo
              </option>
              <option value="CD" className="text-slate-900">
                Congo, Democratic Republic of the
              </option>
              <option value="CK" className="text-slate-900">
                Cook Islands
              </option>
              <option value="CR" className="text-slate-900">
                Costa Rica
              </option>
              <option value="CI" className="text-slate-900">
                Côte d'Ivoire
              </option>
              <option value="HR" className="text-slate-900">
                Croatia
              </option>
              <option value="CU" className="text-slate-900">
                Cuba
              </option>
              <option value="CW" className="text-slate-900">
                Curaçao
              </option>
              <option value="CY" className="text-slate-900">
                Cyprus
              </option>
              <option value="CZ" className="text-slate-900">
                Czechia
              </option>
              <option value="DK" className="text-slate-900">
                Denmark
              </option>
              <option value="DJ" className="text-slate-900">
                Djibouti
              </option>
              <option value="DM" className="text-slate-900">
                Dominica
              </option>
              <option value="DO" className="text-slate-900">
                Dominican Republic
              </option>
              <option value="EC" className="text-slate-900">
                Ecuador
              </option>
              <option value="EG" className="text-slate-900">
                Egypt
              </option>
              <option value="SV" className="text-slate-900">
                El Salvador
              </option>
              <option value="GQ" className="text-slate-900">
                Equatorial Guinea
              </option>
              <option value="ER" className="text-slate-900">
                Eritrea
              </option>
              <option value="EE" className="text-slate-900">
                Estonia
              </option>
              <option value="SZ" className="text-slate-900">
                Eswatini
              </option>
              <option value="ET" className="text-slate-900">
                Ethiopia
              </option>
              <option value="FK" className="text-slate-900">
                Falkland Islands (Malvinas)
              </option>
              <option value="FO" className="text-slate-900">
                Faroe Islands
              </option>
              <option value="FJ" className="text-slate-900">
                Fiji
              </option>
              <option value="FI" className="text-slate-900">
                Finland
              </option>
              <option value="FR" className="text-slate-900">
                France
              </option>
              <option value="GF" className="text-slate-900">
                French Guiana
              </option>
              <option value="PF" className="text-slate-900">
                French Polynesia
              </option>
              <option value="TF" className="text-slate-900">
                French Southern Territories
              </option>
              <option value="GA" className="text-slate-900">
                Gabon
              </option>
              <option value="GM" className="text-slate-900">
                Gambia
              </option>
              <option value="GE" className="text-slate-900">
                Georgia
              </option>
              <option value="DE" className="text-slate-900">
                Germany
              </option>
              <option value="GH" className="text-slate-900">
                Ghana
              </option>
              <option value="GI" className="text-slate-900">
                Gibraltar
              </option>
              <option value="GR" className="text-slate-900">
                Greece
              </option>
              <option value="GL" className="text-slate-900">
                Greenland
              </option>
              <option value="GD" className="text-slate-900">
                Grenada
              </option>
              <option value="GP" className="text-slate-900">
                Guadeloupe
              </option>
              <option value="GU" className="text-slate-900">
                Guam
              </option>
              <option value="GT" className="text-slate-900">
                Guatemala
              </option>
              <option value="GG" className="text-slate-900">
                Guernsey
              </option>
              <option value="GN" className="text-slate-900">
                Guinea
              </option>
              <option value="GW" className="text-slate-900">
                Guinea-Bissau
              </option>
              <option value="GY" className="text-slate-900">
                Guyana
              </option>
              <option value="HT" className="text-slate-900">
                Haiti
              </option>
              <option value="HM" className="text-slate-900">
                Heard Island and McDonald Islands
              </option>
              <option value="VA" className="text-slate-900">
                Holy See
              </option>
              <option value="HN" className="text-slate-900">
                Honduras
              </option>
              <option value="HK" className="text-slate-900">
                Hong Kong
              </option>
              <option value="HU" className="text-slate-900">
                Hungary
              </option>
              <option value="IS" className="text-slate-900">
                Iceland
              </option>
              <option value="IN" className="text-slate-900">
                India
              </option>
              <option value="ID" className="text-slate-900">
                Indonesia
              </option>
              <option value="IR" className="text-slate-900">
                Iran
              </option>
              <option value="IQ" className="text-slate-900">
                Iraq
              </option>
              <option value="IE" className="text-slate-900">
                Ireland
              </option>
              <option value="IM" className="text-slate-900">
                Isle of Man
              </option>
              <option value="IL" className="text-slate-900">
                Israel
              </option>
              <option value="IT" className="text-slate-900">
                Italy
              </option>
              <option value="JM" className="text-slate-900">
                Jamaica
              </option>
              <option value="JP" className="text-slate-900">
                Japan
              </option>
              <option value="JE" className="text-slate-900">
                Jersey
              </option>
              <option value="JO" className="text-slate-900">
                Jordan
              </option>
              <option value="KZ" className="text-slate-900">
                Kazakhstan
              </option>
              <option value="KE" className="text-slate-900">
                Kenya
              </option>
              <option value="KI" className="text-slate-900">
                Kiribati
              </option>
              <option value="KP" className="text-slate-900">
                Korea, North
              </option>
              <option value="KR" className="text-slate-900">
                Korea, South
              </option>
              <option value="KW" className="text-slate-900">
                Kuwait
              </option>
              <option value="KG" className="text-slate-900">
                Kyrgyzstan
              </option>
              <option value="LA" className="text-slate-900">
                Laos
              </option>
              <option value="LV" className="text-slate-900">
                Latvia
              </option>
              <option value="LB" className="text-slate-900">
                Lebanon
              </option>
              <option value="LS" className="text-slate-900">
                Lesotho
              </option>
              <option value="LR" className="text-slate-900">
                Liberia
              </option>
              <option value="LY" className="text-slate-900">
                Libya
              </option>
              <option value="LI" className="text-slate-900">
                Liechtenstein
              </option>
              <option value="LT" className="text-slate-900">
                Lithuania
              </option>
              <option value="LU" className="text-slate-900">
                Luxembourg
              </option>
              <option value="MO" className="text-slate-900">
                Macao
              </option>
              <option value="MG" className="text-slate-900">
                Madagascar
              </option>
              <option value="MW" className="text-slate-900">
                Malawi
              </option>
              <option value="MY" className="text-slate-900">
                Malaysia
              </option>
              <option value="MV" className="text-slate-900">
                Maldives
              </option>
              <option value="ML" className="text-slate-900">
                Mali
              </option>
              <option value="MT" className="text-slate-900">
                Malta
              </option>
              <option value="MH" className="text-slate-900">
                Marshall Islands
              </option>
              <option value="MQ" className="text-slate-900">
                Martinique
              </option>
              <option value="MR" className="text-slate-900">
                Mauritania
              </option>
              <option value="MU" className="text-slate-900">
                Mauritius
              </option>
              <option value="YT" className="text-slate-900">
                Mayotte
              </option>
              <option value="MX" className="text-slate-900">
                Mexico
              </option>
              <option value="FM" className="text-slate-900">
                Micronesia
              </option>
              <option value="MD" className="text-slate-900">
                Moldova
              </option>
              <option value="MC" className="text-slate-900">
                Monaco
              </option>
              <option value="MN" className="text-slate-900">
                Mongolia
              </option>
              <option value="ME" className="text-slate-900">
                Montenegro
              </option>
              <option value="MS" className="text-slate-900">
                Montserrat
              </option>
              <option value="MA" className="text-slate-900">
                Morocco
              </option>
              <option value="MZ" className="text-slate-900">
                Mozambique
              </option>
              <option value="MM" className="text-slate-900">
                Myanmar
              </option>
              <option value="NA" className="text-slate-900">
                Namibia
              </option>
              <option value="NR" className="text-slate-900">
                Nauru
              </option>
              <option value="NP" className="text-slate-900">
                Nepal
              </option>
              <option value="NL" className="text-slate-900">
                Netherlands
              </option>
              <option value="NC" className="text-slate-900">
                New Caledonia
              </option>
              <option value="NZ" className="text-slate-900">
                New Zealand
              </option>
              <option value="NI" className="text-slate-900">
                Nicaragua
              </option>
              <option value="NE" className="text-slate-900">
                Niger
              </option>
              <option value="NU" className="text-slate-900">
                Niue
              </option>
              <option value="NF" className="text-slate-900">
                Norfolk Island
              </option>
              <option value="MK" className="text-slate-900">
                North Macedonia
              </option>
              <option value="MP" className="text-slate-900">
                Northern Mariana Islands
              </option>
              <option value="NO" className="text-slate-900">
                Norway
              </option>
              <option value="OM" className="text-slate-900">
                Oman
              </option>
              <option value="PK" className="text-slate-900">
                Pakistan
              </option>
              <option value="PW" className="text-slate-900">
                Palau
              </option>
              <option value="PS" className="text-slate-900">
                Palestine
              </option>
              <option value="PA" className="text-slate-900">
                Panama
              </option>
              <option value="PG" className="text-slate-900">
                Papua New Guinea
              </option>
              <option value="PY" className="text-slate-900">
                Paraguay
              </option>
              <option value="PE" className="text-slate-900">
                Peru
              </option>
              <option value="PH" className="text-slate-900">
                Philippines
              </option>
              <option value="PN" className="text-slate-900">
                Pitcairn
              </option>
              <option value="PL" className="text-slate-900">
                Poland
              </option>
              <option value="PT" className="text-slate-900">
                Portugal
              </option>
              <option value="PR" className="text-slate-900">
                Puerto Rico
              </option>
              <option value="QA" className="text-slate-900">
                Qatar
              </option>
              <option value="RE" className="text-slate-900">
                Réunion
              </option>
              <option value="RO" className="text-slate-900">
                Romania
              </option>
              <option value="RU" className="text-slate-900">
                Russia
              </option>
              <option value="RW" className="text-slate-900">
                Rwanda
              </option>
              <option value="BL" className="text-slate-900">
                Saint Barthélemy
              </option>
              <option value="SH" className="text-slate-900">
                Saint Helena, Ascension and Tristan da Cunha
              </option>
              <option value="KN" className="text-slate-900">
                Saint Kitts and Nevis
              </option>
              <option value="LC" className="text-slate-900">
                Saint Lucia
              </option>
              <option value="MF" className="text-slate-900">
                Saint Martin (French part)
              </option>
              <option value="PM" className="text-slate-900">
                Saint Pierre and Miquelon
              </option>
              <option value="VC" className="text-slate-900">
                Saint Vincent and the Grenadines
              </option>
              <option value="WS" className="text-slate-900">
                Samoa
              </option>
              <option value="SM" className="text-slate-900">
                San Marino
              </option>
              <option value="ST" className="text-slate-900">
                Sao Tome and Principe
              </option>
              <option value="SA" className="text-slate-900">
                Saudi Arabia
              </option>
              <option value="SN" className="text-slate-900">
                Senegal
              </option>
              <option value="RS" className="text-slate-900">
                Serbia
              </option>
              <option value="SC" className="text-slate-900">
                Seychelles
              </option>
              <option value="SL" className="text-slate-900">
                Sierra Leone
              </option>
              <option value="SG" className="text-slate-900">
                Singapore
              </option>
              <option value="SX" className="text-slate-900">
                Sint Maarten (Dutch part)
              </option>
              <option value="SK" className="text-slate-900">
                Slovakia
              </option>
              <option value="SI" className="text-slate-900">
                Slovenia
              </option>
              <option value="SB" className="text-slate-900">
                Solomon Islands
              </option>
              <option value="SO" className="text-slate-900">
                Somalia
              </option>
              <option value="ZA" className="text-slate-900">
                South Africa
              </option>
              <option value="GS" className="text-slate-900">
                South Georgia and the South Sandwich Islands
              </option>
              <option value="SS" className="text-slate-900">
                South Sudan
              </option>
              <option value="ES" className="text-slate-900">
                Spain
              </option>
              <option value="LK" className="text-slate-900">
                Sri Lanka
              </option>
              <option value="SD" className="text-slate-900">
                Sudan
              </option>
              <option value="SR" className="text-slate-900">
                Suriname
              </option>
              <option value="SJ" className="text-slate-900">
                Svalbard and Jan Mayen
              </option>
              <option value="SE" className="text-slate-900">
                Sweden
              </option>
              <option value="CH" className="text-slate-900">
                Switzerland
              </option>
              <option value="SY" className="text-slate-900">
                Syria
              </option>
              <option value="TW" className="text-slate-900">
                Taiwan
              </option>
              <option value="TJ" className="text-slate-900">
                Tajikistan
              </option>
              <option value="TZ" className="text-slate-900">
                Tanzania
              </option>
              <option value="TH" className="text-slate-900">
                Thailand
              </option>
              <option value="TL" className="text-slate-900">
                Timor-Leste
              </option>
              <option value="TG" className="text-slate-900">
                Togo
              </option>
              <option value="TK" className="text-slate-900">
                Tokelau
              </option>
              <option value="TO" className="text-slate-900">
                Tonga
              </option>
              <option value="TT" className="text-slate-900">
                Trinidad and Tobago
              </option>
              <option value="TN" className="text-slate-900">
                Tunisia
              </option>
              <option value="TR" className="text-slate-900">
                Türkiye
              </option>
              <option value="TM" className="text-slate-900">
                Turkmenistan
              </option>
              <option value="TC" className="text-slate-900">
                Turks and Caicos Islands
              </option>
              <option value="TV" className="text-slate-900">
                Tuvalu
              </option>
              <option value="UG" className="text-slate-900">
                Uganda
              </option>
              <option value="UA" className="text-slate-900">
                Ukraine
              </option>
              <option value="AE" className="text-slate-900">
                United Arab Emirates
              </option>
              <option value="GB" className="text-slate-900">
                United Kingdom
              </option>
              <option value="US" className="text-slate-900">
                United States
              </option>
              <option value="UM" className="text-slate-900">
                United States Minor Outlying Islands
              </option>
              <option value="UY" className="text-slate-900">
                Uruguay
              </option>
              <option value="UZ" className="text-slate-900">
                Uzbekistan
              </option>
              <option value="VU" className="text-slate-900">
                Vanuatu
              </option>
              <option value="VE" className="text-slate-900">
                Venezuela
              </option>
              <option value="VN" className="text-slate-900">
                Vietnam
              </option>
              <option value="VG" className="text-slate-900">
                Virgin Islands (British)
              </option>
              <option value="VI" className="text-slate-900">
                Virgin Islands (U.S.)
              </option>
              <option value="WF" className="text-slate-900">
                Wallis and Futuna
              </option>
              <option value="EH" className="text-slate-900">
                Western Sahara
              </option>
              <option value="YE" className="text-slate-900">
                Yemen
              </option>
              <option value="ZM" className="text-slate-900">
                Zambia
              </option>
              <option value="ZW" className="text-slate-900">
                Zimbabwe
              </option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              className={darkField}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Street Address
          </label>
          <textarea
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Enter your full street address"
            rows={3}
            className={`${darkField} resize-y`}
          />
        </div>


{/* Account Security & Compliance */}
<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
    Account Security &amp; Compliance
  </p>

  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

    {/* Account Status */}
    <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 px-3 py-3">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 animate-quantum-blink" />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] font-medium text-slate-700">
          Account:
        </span>
        <span className="text-[12px] font-bold text-emerald-700">
          Active
        </span>
      </div>
    </div>

    {/* KYC Status */}
    <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 px-3 py-3">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 animate-quantum-blink" />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] font-medium text-slate-700">
          KYC Status:
        </span>
        <span className="text-[12px] font-bold text-amber-700">
          Pending
        </span>
      </div>
    </div>

    {/* Joined Date */}
    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-3">
      <Calendar size={15} className="shrink-0 text-slate-500" />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] font-medium text-slate-600">
          Joined:
        </span>
        <span className="text-[12px] font-bold text-slate-900">
          Nov 15, 2026
        </span>
      </div>
    </div>

  </div>
</div>

        {saveError && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <p className="text-[12.5px] font-medium text-rose-700">{saveError}</p>
          </div>
        )}

        {saved && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-[12.5px] font-medium text-emerald-700">
              Your profile has been saved successfully.
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Identity Verification KYC banner */}
      <div className="mt-5 flex flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/70">
            <Shield size={20} className="text-amber-700" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-amber-900">
              Identity Verification (KYC)
            </p>
            <p className="mt-0.5 text-[12px] text-amber-800">
              Complete verification to increase your withdrawal limits and unlock institutional tier
              vaults.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/kyc"
          className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600 sm:w-auto"
        >
          Verify Identity →
        </Link>
      </div>
    </div>
  );
}
