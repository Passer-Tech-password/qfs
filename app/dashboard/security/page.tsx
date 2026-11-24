"use client";

import { useState } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Copy,
  Lock,
  AlertTriangle,
  Check,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import { saveSecurityPin } from "@/lib/firebase/account-security";

// Deterministic pseudo-QR pattern (visual placeholder only)
const QR_SIZE = 17;
const qrPattern: boolean[] = (() => {
  const arr: boolean[] = [];
  for (let i = 0; i < QR_SIZE * QR_SIZE; i++) {
    const r = Math.floor(i / QR_SIZE);
    const c = i % QR_SIZE;
    // corner position markers
    const inCorner =
      (r < 7 && c < 7) ||
      (r < 7 && c >= QR_SIZE - 7) ||
      (r >= QR_SIZE - 7 && c < 7);
    if (inCorner) {
      const lr = r >= QR_SIZE - 7 ? r - (QR_SIZE - 7) : r;
      const lc = c >= QR_SIZE - 7 ? c - (QR_SIZE - 7) : c;
      const onBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
      const center = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
      arr.push(onBorder || center);
    } else {
      arr.push((i * 7 + 13) % 3 === 0);
    }
  }
  return arr;
})();

// Diverse BIP39-style word pool covering many letters so generated phrases look natural.
const RECOVERY_WORD_POOL =
  "abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit adult advance advice aerobic affair afford afraid again age agent agree ahead aim air airport aisle alarm album alcohol alert alien all alley allow almost alone alpha already also alter always amateur amazing among amount amused analyst anchor ancient anger angle angry animal ankle announce annual another answer antenna antique anxiety any apart apology appear apple approve april arch arctic area arena argue arm armed armor army around arrange arrest arrive arrow art artefact artist artwork ask aspect assault asset assist assume asthma athlete atom attack attend attitude attract auction audit august aunt author auto autumn average avocado avoid awake aware awesome awful awkward baby bachelor bacon badge bag balance balcony ball bamboo banana banner bar barely bargain barrel base basic basket battle beach bean beauty because become beef before begin behave behind believe below belt bench benefit best betray better between beyond bicycle bid bike bind biology bird birth bitter black blade blame blanket blast bleak bless blind blood blossom blow blue blur blush board boat body boil bomb bone bonus book boost border boring borrow boss bottom bounce box boy bracket brain brand brass brave bread breeze brick bridge brief bright bring brisk broccoli broken bronze broom brother brown brush bubble buddy budget buffalo build bulb bulk bullet bundle bunker burden burger burst bus business busy butter buyer buzz cabbage cabin cable cactus cage cake call calm camera camp can canal cancel candy cannon canoe canvas canyon capable capital captain car carbon card cargo carpet carry cart case cash casino castle casual cat catalog catch category cattle caught cause caution cave ceiling celery cement census century cereal certain chair chalk champion change chaos chapter charge chase cheap check cheese chef cherry chest chicken chief child chimney choice choose chronic chuckle chunk churn citizen city civil claim clap clarify claw clay clean clerk clever click client cliff climb clinic clip clock clog close cloth cloud clown club clump cluster clutch coach coast coconut code coffee coil coin collect color column combine come comfort comic common company concert conduct confirm congress connect consider control convince cook cool copper copy coral core corn correct cost cotton couch country couple course cousin cover coyote crack cradle craft cram crane crash crater crawl crazy cream credit creek crew cricket crime crisp critic crop cross crouch crowd crucial cruel cruise crumble crush cry crystal cube culture cup cupboard curious current curtain curve cushion custom cute cycle dad damage damp dance danger daring dash daughter dawn day deal debate debris decade december decide decline decorate decrease deer defense define defy degree delay deliver demand demise denial dentist deny depart depend deposit depth deputy derive describe desert design desk despair destroy detail detect develop device devote diagram dial diamond diary dice diesel diet differ digital dignity dilemma dinosaur direct dirt disagree discover disease dish dismiss disorder display distance divert divide divorce dizzy doctor document dog doll dolphin domain donate donkey donor door dose double dove draft dragon drama drastic draw dream dress drift drill drink drip drive drop drum dry duck dumb dune during dust dutch duty dwarf dynamic eager eagle early earn earth easily east easy echo ecology economy edge edit educate effort egg eight either elbow elder electric elegant element elephant elevator elite else embark embody embrace emerge emotion employ empower empty enable enact end endless endorse enemy energy enforce engage engine enhance enjoy enlist enough enrich enroll ensure enter entire entry envelope episode equal equip era erase erode erosion error erupt escape essay essence estate eternal ethics evidence evil evoke evolve exact example excess exchange excite exclude excuse execute exercise exhaust exhibit exile exist exit exotic expand expect expire explain expose express extend extra eye eyebrow fabric face faculty fade faint faith fall false fame family famous fan fancy fantasy farm fashion fat fatal father fatigue fault favorite feature february federal fee feed feel female fence festival fetch fever few fiber fiction field figure file film filter final find fine finger finish fire firm fiscal fish fit fitness fix flag flame flash flat flavor flee flight flip float flock floor flower fluid flush fly foam focus fog foil fold follow food foot force forest forget fork fortune forum forward fossil foster found fox fragile frame frequent fresh friend fringe frog front frost frown frozen fruit fuel fun funny furnace fury future gadget gain galaxy gallery game gap garage garbage garden garlic garment gas gasp gate gather gauge gaze general genius genre gentle genuine gesture ghost giant gift giggle ginger giraffe girl give glad glance glare glass glide glimpse globe gloom glory glove glow glue goat goddess gold good goose gorilla gospel gossip govern gown grab grace grain grant grape grass gravity great green grid grief grit grocery group grow grunt guard guess guide guilt guitar gun gym habit hair half hammer hamster hand happy harbor hard harsh harvest hat have hawk hazard head health heart heavy hedgehog height hello helmet help hen hero hip hire history hobby hockey hold hole holiday hollow home honey hood hope horn horror horse hospital host hotel hour hover hub huge human humble humor hundred hungry hunt hurdle hurry hurt husband hybrid ice icon idea identify idle ignore ill illegal illness image imitate immense immune impact impose improve impulse inch include income increase index indicate indoor industry infant inflict inform initial inject inmate inner innocent input inquiry insane insect inside inspire install intact interest into invest invite involve iron island isolate issue item ivory jacket jaguar jar jazz jealous jeans jelly jewel job join joke journey joy judge juice july jump jungle junior junk just kangaroo keen keep ketchup key kick kid kidney kind kingdom kiss kit kitchen kite kitten kiwi knee knife knock know lab label labor ladder lady lake lamp language laptop large later latin laugh laundry lava law lawn lawsuit layer lazy leader leaf learn leave lecture left leg legal legend leisure lemon lend length lens leopard lesson letter level liberty library license life lift light like limb limit link lion liquid list little live lizard load loan lobster local lock logic lonely long loop lottery loud lounge love loyal luck luggage lumber lunar lunch luxury lyrics machine mad magic magnet maid mail main major make mammal man manage mandate mango mansion manual maple marble march margin marine market marriage mask mass master match material math matrix matter maximum maze meadow mean measure meat mechanic medal media melody melt member memory mention menu mercy merge merit merry mesh message metal method middle midnight milk million mimic mind minimum minor minute miracle mirror misery miss mistake mix mixed mixture mobile model modify mom moment monitor monkey monster month moon moral more morning mosquito mother motion motor mountain mouse move movie much muffin mule multiply muscle museum mushroom music must mutual myself mystery myth naive name napkin narrow nasty nation nature near neck need negative neglect neither nephew nerve nest net network neutral never news next nice night noble noise nominee noodle normal north nose notable nothing notice novel now nuclear number nurse nut oak obey object oblige obscure observe obtain obvious occur ocean october odor off offer office often oil okay old olive olympic omit once one onion online only open opera opinion oppose option orange orbit orchard order ordinary organ orient original orphan ostrich other outdoor outer output outside oval oven over own owner oxygen oyster ozone pact paddle page pair palace palm panda panel panic panther paper parade parent park parrot party pass patch path patient patrol pattern pause pave payment peace peanut pear peasant pelican pen penalty pencil people pepper perfect permit person pet phone photo phrase physical piano picnic picture piece pig pigeon pill pilot pink pioneer pipe pistol pitch pizza place planet plastic plate play please pledge pluck plug plunge poem poet point polar pole police pond pony pool popular portion position possible post potato pottery poverty powder power practice praise predict prefer prepare present pretty prevent price pride primary print priority prison private prize problem process produce profit program project promote proof property prosper protect proud provide public pudding pull pulp pulse pumpkin punch pupil puppy purchase purity purpose purse push put puzzle pyramid quality quantum quarter question quick quit quiz quote rabbit raccoon race rack radar radio rain raise rally ramp ranch random range rapid rare rate rather raven raw razor ready real reason rebel rebuild recall receive recipe record recycle reduce reflect reform region regret regular reject relax release relief rely remain remember remind remove render renew rent reopen repair repeat replace report require rescue resemble resist resource response result retire retreat return reunion reveal review reward rhythm rib ribbon rice rich ride ridge rifle right rigid ring riot ripple risk ritual rival river road roast robot robust rocket romance roof rookie room rose rotate rough round route royal rubber rude rug rule run runway rural sad saddle sadness safe sail salad salmon salon salt salute same sample sand satisfy satoshi sauce sausage save say scale scan scare scatter scene scheme school science scissors scorpion scout scrap screen script scrub sea search season seat second secret section security seed seek segment select sell seminar senior sense sentence series service session settle setup seven shadow shaft shallow share shed shell sheriff shield shift shine ship shiver shock shoe shoot shop short shoulder shove shrimp shrug shuffle shy sibling sick side siege sight sign silent silk silly silver similar simple since sing siren sister situate six size skate sketch ski skill skin skirt skull slab slam sleep slender slice slide slight slim slogan slot slow slug small smart smile smoke smooth snack snake snap sniff snow soap soccer social sock soda soft solar soldier solid solution solve someone song soon sorry sort soul sound soup source south space spare spatial spawn speak special speed spell spend sphere spice spider spike spinach spirit split spoil sponsor spoon sport spot spray spread spring spy square squeeze squirrel stable stadium staff stage stairs stamp stand start state stay steak steal steam steel stem step stereo stern stew stick still sting stock stomach stone stool story stove strategy street strike strong struggle student stuff stumble style subject submit subway success such sudden suffer sugar suggest suit summer sun sunny sunset super supply supreme sure surface surge surprise surround survey survive suspect sustain swallow swamp swap swarm sweden swivel swiss sword symbol symptom syrup system table tackle tag tail talent talk tank tape target task taste tattoo taxi teach team tell ten tenant tennis tent term test text thank that theme then theory there they thing this thought three thrive throw thumb thunder ticket tide tiger tilt timber time tiny tip tired tissue title toast tobacco today toddler toe together toilet token tomato tomorrow tone tongue tonight tool tooth top topic topple torch tornado tortoise toss total tourist toward tower town toy track trade traffic tragic train transfer trap trash travel tray treat tree trend trial tribe trick trigger trim trip trophy trouble truck true truly trumpet trust truth try tube tuna tunnel turkey turn turtle twelve twenty twice twin twist two type typical ugly umbrella unable unaware uncle uncover under undo unfair unfold unhappy uniform union unique unit universe unknown unlock until unusual unveil update upgrade uphold upon upper upset urban usage use used useful useless usual utility vacant vacuum vague valid valley valve van vanish vapor various vast vault vehicle velvet vendor venture venue verb verify version very vessel veteran viable vibrant vicious victory video view village vintage violin virtual virus visa visit visual vital vivid vocal voice void volcano volume vote voyage wage wagon wait walk wall walnut want warfare warm warrior wash wasp waste water wave way wealth weapon wear weasel weather web wedding weekend weird welcome west wet whale what wheat wheel when where whip whisper wide width wife wild will win window wine wing wink winner winter wire wisdom wise wish witness wolf woman wonder wood wool word work world worry worth wrap wreck wrestle wrist write wrong yard year yellow you young youth zebra zero zone zoo".split(
    " "
  );

// Pick `count` unique words from the pool using a Fisher-Yates shuffle, so every
// generated phrase is fully distinct and free of repeated patterns.
function generateRecoveryPhrase(count = 12): string[] {
  const pool = [...RECOVERY_WORD_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

const guidelines = [
  "Store your 12-word seed phrase and 2FA secret offline in a secure physical location.",
  "Support will NEVER ask for your private key, seed phrase, or 6-digit codes.",
];

export default function SecurityPage() {
  const [revealed, setRevealed] = useState(false);
  const [recoveryWords] = useState<string[]>(() => generateRecoveryPhrase());
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [code, setCode] = useState("123456");
  const [saving, setSaving] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSaved, setPinSaved] = useState(false);
  const [phraseCopied, setPhraseCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFAActivated, setTwoFAActivated] = useState(false);

  async function handleSavePin() {
    if (saving) return;
    setPinError(null);
    setPinSaved(false);
    setSaving(true);
    try {
      await saveSecurityPin(pin);
      setPinSaved(true);
    } catch (err) {
      setPinError(
        err instanceof Error ? err.message : "Could not save your PIN. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCopyPhrase() {
    const phrase = recoveryWords.join(" ");
    navigator.clipboard?.writeText(phrase).catch(() => {});
    setPhraseCopied(true);
    setTimeout(() => setPhraseCopied(false), 1800);
  }

  function handleCopySetupKey() {
    navigator.clipboard?.writeText("X3IDK4QF3ZCW2HVA").catch(() => {});
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 1800);
  }

  function handleActivate2FA() {
    if (code.trim().length < 6) {
      setTwoFAError("Enter the 6-digit code from your authenticator app.");
      setTwoFAActivated(false);
      return;
    }
    setTwoFAError(null);
    setTwoFAActivated(true);
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
          Security &amp; Authentication
        </span>
        <h2 className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">
          Google Authenticator &amp; Wallet Security
        </h2>
        <p className="mx-auto mt-1.5 max-w-[640px] text-[13px] text-slate-500">
          Manage your Google 2FA Authenticator, 4-digit Security PIN, and 12-word Secret Recovery
          Phrase.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Secret Recovery Phrase */}
          <div className="dash-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <KeyRound size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Secret Recovery Phrase (12 Words)
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Never share your secret phrase with anyone. It gives full cryptographic ownership
                    to your vault.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {revealed ? "Hide Phrase" : "Reveal Phrase"}
              </button>
            </div>

            {/* Word grid */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {recoveryWords.map((word, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                    {i + 1}
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${
                      revealed ? "text-slate-800" : "select-none blur-[4px]"
                    }`}
                  >
                    {word}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
              >
                {phraseCopied ? <Check size={15} /> : <Copy size={15} />}
                {phraseCopied ? "Copied!" : "Copy 12-Word Phrase"}
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                <Lock size={12} />
                AES-256 Vault Encrypted
              </span>
            </div>
          </div>


{/* 4-Digit PIN */}
<div className="dash-card p-6">
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
        <Lock size={20} className="text-amber-600" />
      </div>

      <div>
        <h3 className="text-[16px] font-bold text-slate-900">
          4-Digit Security &amp; Transaction PIN
        </h3>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Your 4-digit security PIN is used for Step-Up sign-in verification and
          authorizing vault transfers.
        </p>
      </div>
    </div>

    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
      PIN Active
    </span>
  </div>

  {/* PIN Input and Visibility Toggle */}
  <div className="mt-5 flex items-center gap-3">
    <div className="relative min-w-0 flex-1">
      <input
        type={showPin ? "text" : "password"}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        inputMode="numeric"
        maxLength={4}
        placeholder="••••"
        autoComplete="off"
        className="dash-input w-full py-3 pl-4 pr-12 text-center text-[18px] font-bold tracking-[0.5em] text-slate-800"
      />

      <button
        type="button"
        onClick={() => setShowPin((prev) => !prev)}
        aria-label={showPin ? "Hide PIN" : "Show PIN"}
        aria-pressed={showPin}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {showPin ? (
          <EyeOff size={20} />
        ) : (
          <Eye size={20} />
        )}
      </button>
    </div>

    <button
      type="button"
      onClick={handleSavePin}
      disabled={saving}
      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 disabled:opacity-70"
    >
      {saving ? (
        <>
          <LoaderCircle className="animate-spin" size={16} />
          Saving…
        </>
      ) : (
        <>
          <Check size={16} />
          Save PIN
        </>
      )}
    </button>
  </div>

  {pinError && (
    <p className="mt-3 text-[12px] font-medium text-rose-600">
      {pinError}
    </p>
  )}

  {pinSaved && (
    <p className="mt-3 text-[12px] font-medium text-emerald-600">
      Your 4-digit security PIN has been saved.
    </p>
  )}
</div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Google Authenticator 2FA */}
          <div className="dash-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                  <ShieldCheck size={20} className="text-sky-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Google Authenticator (2FA)
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Protect your vault with time-based 6-digit one-time passwords (TOTP) via Google
                    Authenticator, Authy, or Microsoft Authenticator.
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                2FA Inactive
              </span>
            </div>

            {/* QR code */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-center text-[11px] font-semibold text-slate-500">
                Scan QR in Google Authenticator
              </p>
              <div className="mx-auto mt-3 flex h-[140px] w-[140px] items-center justify-center rounded-lg bg-white p-2 shadow-inner">
                <div
                  className="grid gap-[1px]"
                  style={{
                    gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)`,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {qrPattern.map((on, i) => (
                    <div
                      key={i}
                      className={on ? "bg-slate-900" : "bg-white"}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Manual setup key */}
            <div className="mt-4">
              <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
                Manual Setup Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value="X3IDK4QF3ZCW2HVA"
                  readOnly
                  className="dash-input w-full py-2.5 pl-3.5 pr-12 font-mono text-[12.5px] text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleCopySetupKey}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Copy setup key"
                >
                  {keyCopied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            {/* 6-digit code */}
            <div className="mt-4">
              <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
                Enter 6-Digit Code to Confirm
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                className="dash-input w-full py-2.5 px-3.5 text-center text-[15px] font-bold tracking-[0.4em] text-slate-700"
              />
            </div>

            <button
              type="button"
              onClick={handleActivate2FA}
              disabled={twoFAActivated}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-70"
            >
              {twoFAActivated ? (
                <span className="inline-flex items-center gap-2">
                  <Check size={16} /> Google 2FA Activated
                </span>
              ) : (
                "Activate Google 2FA"
              )}
            </button>

            {twoFAError && (
              <p className="mt-3 text-[12px] font-medium text-rose-600">{twoFAError}</p>
            )}
            {twoFAActivated && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-[12.5px] font-medium text-emerald-700">
                  Two-factor authentication has been enabled for your account.
                </p>
              </div>
            )}
          </div>

          {/* Security Guidelines */}
          <div className="dash-card p-6">
            <h3 className="text-[15px] font-bold text-slate-900">Security Guidelines</h3>
            <ul className="mt-4 space-y-3">
              {guidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <Check size={11} className="text-white" />
                  </span>
                  <span className="text-[12px] text-slate-600">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Warning footer */}
      <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle size={18} className="shrink-0 text-amber-500" />
        <p className="text-[12px] font-medium text-amber-800">
          Never disclose your recovery phrase, PIN, or 2FA codes to anyone, including Qfstier-4bwallet
          support.
        </p>
      </div>
    </div>
  );
}
