/**
 * RIFQ Muslim - bundled Islamic content library.
 * Works offline on both platforms; the Qur'an itself is served by the shared
 * backend from the full Uthmani text with Sahih International translation.
 */

export const DUAS = [
  {
    id: 'd1',
    category: 'Morning & Evening',
    title: 'Morning remembrance',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    translit: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah",
    translation: 'We have entered the morning and the dominion belongs to Allah. Praise is to Allah. There is no god but Allah alone, without partner.',
    reference: 'Abu Dawud 5068'
  },
  {
    id: 'd2',
    category: 'Morning & Evening',
    title: 'Sayyid al-Istighfar (the master of seeking forgiveness)',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي',
    translit:
      "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayy, wa abu'u bidhanbi faghfir li",
    translation:
      'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I keep Your covenant as much as I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me.',
    reference: 'Bukhari 6306'
  },
  {
    id: 'd3',
    category: 'Morning & Evening',
    title: 'Protection from harm',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    translit: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama', wa huwas-Sami'ul-'Alim",
    translation:
      'In the name of Allah, with whose name nothing on earth or in heaven can cause harm; He is the All-Hearing, the All-Knowing. (Recite three times, morning and evening.)',
    reference: 'Abu Dawud 5088, Tirmidhi 3388'
  },
  {
    id: 'd4',
    category: 'Morning & Evening',
    title: 'Contentment with Allah',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    translit: "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin sallallahu 'alayhi wa sallam nabiyya",
    translation: 'I am content with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    reference: 'Abu Dawud 5072'
  },
  {
    id: 'd5',
    category: 'Protection',
    title: 'Refuge in the perfect words of Allah',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translit: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created. (Three times in the evening.)',
    reference: 'Muslim 2708'
  },
  {
    id: 'd6',
    category: 'Protection',
    title: 'Against anxiety and debt',
    arabic:
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    translit:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa da'alayni wa ghalabatir-rijal",
    translation:
      'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by others.',
    reference: 'Bukhari 6369'
  },
  {
    id: 'd7',
    category: 'Protection',
    title: 'Sufficient is Allah',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    translit: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa Rabbul-'Arshil-'Azim",
    translation:
      'Allah is sufficient for me. There is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne. (Seven times.)',
    reference: 'Abu Dawud 5081'
  },
  {
    id: 'd8',
    category: 'Forgiveness',
    title: 'Seeking forgiveness for all sins',
    arabic:
      'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ',
    translit: "Allahummaghfir li dhanbi kullahu, diqqahu wa jillahu, wa awwalahu wa akhirahu, wa 'alaniyatahu wa sirrah",
    translation: 'O Allah, forgive me all my sins: small and great, first and last, open and secret.',
    reference: 'Muslim 483'
  },
  {
    id: 'd9',
    category: 'Forgiveness',
    title: 'Turn to me in mercy',
    arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    translit: "Rabbighfir li wa tub 'alayya innaka Antat-Tawwabur-Rahim",
    translation: 'My Lord, forgive me and accept my repentance. You are the Ever-Pardoning, the Most Merciful.',
    reference: 'Tirmidhi 3434'
  },
  {
    id: 'd10',
    category: 'Distress',
    title: 'Dua of Yunus عليه السلام',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    translit: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translation: 'There is no god but You. Glory be to You. Indeed I was among the wrongdoers.',
    reference: "Qur'an 21:87"
  },
  {
    id: 'd11',
    category: 'Distress',
    title: 'Dua of distress',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    translit:
      "La ilaha illallahul-'Azimul-Halim, la ilaha illallahu Rabbul-'Arshil-'Azim, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Karim",
    translation:
      'There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the Mighty Throne. There is no god but Allah, Lord of the heavens, Lord of the earth and Lord of the Noble Throne.',
    reference: 'Bukhari 6345'
  },
  {
    id: 'd12',
    category: 'Distress',
    title: 'Relying on Allah in hardship',
    arabic: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ',
    translit:
      "Allahumma rahmataka arju, fa la takilni ila nafsi tarfata 'ayn, wa aslih li sha'ni kullahu, la ilaha illa ant",
    translation:
      'O Allah, I hope for Your mercy. Do not leave me to myself even for the blink of an eye. Set right all my affairs. There is no god but You.',
    reference: 'Abu Dawud 5090'
  },
  {
    id: 'd13',
    category: 'Travel',
    title: 'Dua for travel',
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى',
    translit:
      "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun. Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa",
    translation:
      'Glory to Him who has subjected this to us, and we could never have done it ourselves. To our Lord we shall surely return. O Allah, we ask You for righteousness and piety on this journey.',
    reference: 'Muslim 1342'
  },
  {
    id: 'd14',
    category: 'Health',
    title: 'Dua for healing',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شَافِيَ إِلَّا أَنْتَ',
    translit: "Allahumma Rabban-nas, adhhibil-bas, ishfi Antash-Shafi, la shafiya illa ant",
    translation: 'O Allah, Lord of mankind, remove the hardship. Heal, for You are the Healer. There is no healer but You.',
    reference: 'Bukhari 5675'
  },
  {
    id: 'd15',
    category: 'Health',
    title: 'Seeking cure for the sick',
    arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    translit: "As'alullahal-'Azima Rabbal-'Arshil-'Azimi an yashfiyak",
    translation: 'I ask Allah the Mighty, Lord of the Mighty Throne, to heal you. (Seven times for the sick.)',
    reference: 'Abu Dawud 3106'
  },
  {
    id: 'd16',
    category: 'Provision',
    title: 'Sufficiency from the lawful',
    arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    translit: "Allahummakfini bihalalika 'an haramik, wa aghnini bifadlika 'amman siwak",
    translation: 'O Allah, suffice me with what You have made lawful instead of what is unlawful, and enrich me by Your grace above all others.',
    reference: 'Tirmidhi 3563'
  },
  {
    id: 'd17',
    category: 'Provision',
    title: 'Beneficial knowledge and good provision',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    translit: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan",
    translation: 'O Allah, I ask You for beneficial knowledge, good provision and accepted deeds.',
    reference: 'Ibn Majah 925'
  },
  {
    id: 'd18',
    category: 'Family',
    title: 'For family and descendants',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    translit: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun, waj'alna lil-muttaqina imama",
    translation:
      'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us leaders of the righteous.',
    reference: "Qur'an 25:74"
  },
  {
    id: 'd19',
    category: 'Family',
    title: 'For righteous children',
    arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ',
    translit: 'Rabbi hab li minas-salihin',
    translation: 'My Lord, grant me a child from among the righteous.',
    reference: "Qur'an 37:100"
  },
  {
    id: 'd20',
    category: 'Gratitude',
    title: 'Remembering and thanking Allah',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    translit: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    translation: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
    reference: 'Abu Dawud 1522'
  },
  {
    id: 'd21',
    category: 'Ramadan',
    title: 'On breaking the fast',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    translit: 'Dhahabaz-zama\'u wabtallatil-\'uruq, wa thabatal-ajru in sha\' Allah',
    translation: 'The thirst is gone, the veins are moistened, and the reward is assured, if Allah wills.',
    reference: 'Abu Dawud 2357'
  },
  {
    id: 'd22',
    category: 'Ramadan',
    title: 'Laylat al-Qadr',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    translit: "Allahumma innaka 'afuwwun karimun tuhibbul-'afwa fa'fu 'anni",
    translation: 'O Allah, You are Pardoning and Generous; You love to pardon, so pardon me.',
    reference: 'Tirmidhi 3513'
  },
  {
    id: 'd23',
    category: 'Daily Life',
    title: 'Before eating',
    arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    translit: 'Bismillahi wa \'ala barakatillah',
    translation: 'In the name of Allah and with the blessing of Allah.',
    reference: 'Abu Dawud 3767'
  },
  {
    id: 'd24',
    category: 'Daily Life',
    title: 'After eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ',
    translit: 'Alhamdulillahil-ladhi at\'amana wa saqana wa ja\'alana minal-muslimin',
    translation: 'Praise be to Allah who fed us, gave us drink, and made us among the Muslims.',
    reference: 'Abu Dawud 3850'
  },
  {
    id: 'd25',
    category: 'Daily Life',
    title: 'Entering the mosque',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    translit: 'Allahummaftah li abwaba rahmatik',
    translation: 'O Allah, open for me the doors of Your mercy.',
    reference: 'Muslim 713'
  },
  {
    id: 'd26',
    category: 'Daily Life',
    title: 'Leaving the mosque',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    translit: "Allahumma inni as'aluka min fadlik",
    translation: 'O Allah, I ask You from Your bounty.',
    reference: 'Muslim 713'
  },
  {
    id: 'd27',
    category: 'Daily Life',
    title: 'Before sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    translit: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live.',
    reference: 'Bukhari 6324'
  },
  {
    id: 'd28',
    category: 'Daily Life',
    title: 'Upon waking',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    translit: 'Alhamdulillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur',
    translation: 'Praise be to Allah who gave us life after death, and to Him is the return.',
    reference: 'Bukhari 6312'
  },
  {
    id: 'd29',
    category: 'Forgiveness',
    title: 'Constant remembrance',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    translit: 'Astaghfirullaha wa atubu ilayh',
    translation: 'I seek the forgiveness of Allah and turn to Him in repentance.',
    reference: 'Bukhari 6307'
  },
  {
    id: 'd30',
    category: 'Protection',
    title: 'Refuge from the Hellfire',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ النَّارِ',
    translit: "Allahumma inni a'udhu bika minan-nar",
    translation: 'O Allah, I seek refuge in You from the Fire.',
    reference: 'Abu Dawud 5079'
  }
];

export const HADITHS = [
  {
    id: 'h1',
    title: 'Actions and intentions',
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    text: 'Actions are judged by intentions, and every person will have only what they intended.',
    reference: 'Bukhari 1, Muslim 1907',
    topic: 'Sincerity'
  },
  {
    id: 'h2',
    title: 'The five pillars',
    arabic: 'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ',
    text:
      'Islam is built upon five: the testimony that there is no god but Allah and that Muhammad is the Messenger of Allah, the prayer, the zakat, the fast of Ramadan, and the pilgrimage to the House.',
    reference: 'Bukhari 8, Muslim 16',
    topic: 'Foundations'
  },
  {
    id: 'h3',
    title: 'Love for your brother',
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    text: 'None of you truly believes until he loves for his brother what he loves for himself.',
    reference: 'Bukhari 13, Muslim 45',
    topic: 'Brotherhood'
  },
  {
    id: 'h4',
    title: 'The best character',
    arabic: 'إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلَاقًا',
    text: 'The best among you are those who have the best manners and character.',
    reference: 'Bukhari 3559',
    topic: 'Character'
  },
  {
    id: 'h5',
    title: 'Allah is Beautiful',
    arabic: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ',
    text: 'Allah is Beautiful and He loves beauty.',
    reference: 'Muslim 91',
    topic: 'Character'
  },
  {
    id: 'h6',
    title: 'Control of anger',
    arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    text: 'The strong man is not the one who overcomes others; the strong man is the one who controls himself when angry.',
    reference: 'Bukhari 6114, Muslim 2609',
    topic: 'Self-control'
  },
  {
    id: 'h7',
    title: 'Guarding the tongue',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    text: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
    reference: 'Bukhari 6018, Muslim 47',
    topic: 'Speech'
  },
  {
    id: 'h8',
    title: 'Ease, not hardship',
    arabic: 'يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا',
    text: 'Make things easy and do not make them difficult; give glad tidings and do not drive people away.',
    reference: 'Bukhari 69',
    topic: 'Da\u2019wah'
  },
  {
    id: 'h9',
    title: 'Cleanliness',
    arabic: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
    text: 'Cleanliness is half of faith.',
    reference: 'Muslim 223',
    topic: 'Purity'
  },
  {
    id: 'h10',
    title: 'Consistency in deeds',
    arabic: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    text: 'The deeds most beloved to Allah are those done consistently, even if they are small.',
    reference: 'Bukhari 6464, Muslim 783',
    topic: 'Worship'
  },
  {
    id: 'h11',
    title: 'Safety of the tongue and hand',
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    text: 'A Muslim is the one from whose tongue and hand the Muslims are safe.',
    reference: 'Bukhari 10',
    topic: 'Character'
  },
  {
    id: 'h12',
    title: 'Thanking people',
    arabic: 'مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ',
    text: 'Whoever does not thank people does not thank Allah.',
    reference: 'Tirmidhi 1954',
    topic: 'Gratitude'
  },
  {
    id: 'h13',
    title: 'Kindness to parents',
    arabic: 'أُمُّكَ، ثُمَّ أُمُّكَ، ثُمَّ أُمُّكَ، ثُمَّ أَبُوكَ',
    text:
      'When asked who deserves the best companionship, the Prophet ﷺ said: "Your mother, then your mother, then your mother, then your father."',
    reference: 'Bukhari 5971, Muslim 2548',
    topic: 'Family'
  },
  {
    id: 'h14',
    title: 'The best of you and the Qur\u2019an',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    text: 'The best of you is the one who learns the Qur\u2019an and teaches it.',
    reference: 'Bukhari 5027',
    topic: 'Qur\u2019an'
  },
  {
    id: 'h15',
    title: 'Do not be angry',
    arabic: 'لَا تَغْضَبْ',
    text: 'A man asked the Prophet ﷺ for advice, and he said: "Do not be angry." He repeated it several times.',
    reference: 'Bukhari 6116',
    topic: 'Self-control'
  },
  {
    id: 'h16',
    title: 'What Allah looks at',
    arabic: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    text: 'Allah does not look at your appearance or your wealth, but He looks at your hearts and your deeds.',
    reference: 'Muslim 2564',
    topic: 'Sincerity'
  },
  {
    id: 'h17',
    title: 'Charity does not decrease wealth',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    text: 'Charity does not decrease wealth.',
    reference: 'Muslim 2588',
    topic: 'Charity'
  },
  {
    id: 'h18',
    title: 'The believer who mixes with people',
    arabic: 'الْمُؤْمِنُ الَّذِي يُخَالِطُ النَّاسَ وَيَصْبِرُ عَلَى أَذَاهُمْ أَعْظَمُ أَجْرًا مِنَ الْمُؤْمِنِ الَّذِي لَا يُخَالِطُ النَّاسَ',
    text:
      'The believer who mixes with people and bears their harm patiently has a greater reward than the believer who does not mix with people.',
    reference: 'Tirmidhi 2507',
    topic: 'Community'
  },
  {
    id: 'h19',
    title: 'Fear Allah wherever you are',
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    text:
      'Fear Allah wherever you are, follow a bad deed with a good one so that it erases it, and treat people with good character.',
    reference: 'Tirmidhi 1987',
    topic: 'Character'
  },
  {
    id: 'h20',
    title: 'Relieving a believer\u2019s distress',
    arabic: 'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ',
    text: 'Whoever relieves a believer of a hardship, Allah will relieve him of a hardship on the Day of Resurrection.',
    reference: 'Muslim 2699',
    topic: 'Mercy'
  },
  {
    id: 'h21',
    title: 'Caring for the vulnerable',
    arabic: 'السَّاعِي عَلَى الْأَرْمَلَةِ وَالْمِسْكِينِ كَالْمُجَاهِدِ فِي سَبِيلِ اللَّهِ',
    text: 'The one who looks after a widow and the poor is like a warrior in the cause of Allah.',
    reference: 'Bukhari 5353',
    topic: 'Charity'
  },
  {
    id: 'h22',
    title: 'Seeking knowledge',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَبْتَغِي فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
    text: 'Whoever treads a path seeking knowledge, Allah will make easy for him a path to Paradise.',
    reference: 'Muslim 2699',
    topic: 'Knowledge'
  },
  {
    id: 'h23',
    title: 'Prayer at its proper time',
    arabic: 'أَفْضَلُ الْأَعْمَالِ الصَّلَاةُ عَلَى وَقْتِهَا',
    text: 'The most virtuous deed is the prayer performed at its proper time.',
    reference: 'Bukhari 527, Muslim 85',
    topic: 'Prayer'
  },
  {
    id: 'h24',
    title: 'The reward of fasting Ramadan',
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    text: 'Whoever fasts Ramadan out of faith and seeking reward will have their previous sins forgiven.',
    reference: 'Bukhari 38, Muslim 760',
    topic: 'Ramadan'
  },
  {
    id: 'h25',
    title: 'A cheerful face',
    arabic: 'لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا، وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلِيقٍ',
    text: 'Do not regard any good deed as insignificant, even meeting your brother with a cheerful face.',
    reference: 'Muslim 2626',
    topic: 'Character'
  },
  {
    id: 'h26',
    title: 'Hajj is Arafah',
    arabic: 'الْحَجُّ عَرَفَةُ',
    text: 'The Prophet ﷺ said: "Hajj is Arafah."',
    reference: 'Tirmidhi 889',
    topic: 'Hajj'
  }
];

export const NAMES_99 = [
  ['الرَّحْمَنُ', 'Ar-Rahman', 'The Most Compassionate'],
  ['الرَّحِيمُ', 'Ar-Rahim', 'The Most Merciful'],
  ['الْمَلِكُ', 'Al-Malik', 'The King, The Sovereign'],
  ['الْقُدُّوسُ', 'Al-Quddus', 'The Most Holy'],
  ['السَّلَامُ', 'As-Salam', 'The Source of Peace'],
  ['الْمُؤْمِنُ', "Al-Mu'min", 'The Granter of Security'],
  ['الْمُهَيْمِنُ', 'Al-Muhaymin', 'The Guardian, The Protector'],
  ['الْعَزِيزُ', "Al-'Aziz", 'The Almighty'],
  ['الْجَبَّارُ', 'Al-Jabbar', 'The Compeller'],
  ['الْمُتَكَبِّرُ', 'Al-Mutakabbir', 'The Supreme, The Majestic'],
  ['الْخَالِقُ', 'Al-Khaliq', 'The Creator'],
  ['الْبَارِئُ', "Al-Bari'", 'The Originator'],
  ['الْمُصَوِّرُ', 'Al-Musawwir', 'The Fashioner of Forms'],
  ['الْغَفَّارُ', 'Al-Ghaffar', 'The All-Forgiving'],
  ['الْقَهَّارُ', 'Al-Qahhar', 'The Subduer'],
  ['الْوَهَّابُ', 'Al-Wahhab', 'The Bestower'],
  ['الرَّزَّاقُ', 'Ar-Razzaq', 'The Provider'],
  ['الْفَتَّاحُ', 'Al-Fattah', 'The Opener, The Judge'],
  ['الْعَلِيمُ', "Al-'Alim", 'The All-Knowing'],
  ['الْقَابِضُ', 'Al-Qabid', 'The Withholder'],
  ['الْبَاسِطُ', 'Al-Basit', 'The Extender'],
  ['الْخَافِضُ', 'Al-Khafid', 'The Abaser'],
  ['الرَّافِعُ', "Ar-Rafi'", 'The Exalter'],
  ['الْمُعِزُّ', "Al-Mu'izz", 'The Honorer'],
  ['الْمُذِلُّ', 'Al-Mudhill', 'The Dishonorer'],
  ['السَّمِيعُ', "As-Sami'", 'The All-Hearing'],
  ['الْبَصِيرُ', 'Al-Basir', 'The All-Seeing'],
  ['الْحَكَمُ', 'Al-Hakam', 'The Judge'],
  ['الْعَدْلُ', "Al-'Adl", 'The Utterly Just'],
  ['اللَّطِيفُ', 'Al-Latif', 'The Subtle, The Gentle'],
  ['الْخَبِيرُ', 'Al-Khabir', 'The All-Aware'],
  ['الْحَلِيمُ', 'Al-Halim', 'The Forbearing'],
  ['الْعَظِيمُ', "Al-'Azim", 'The Magnificent'],
  ['الْغَفُورُ', 'Al-Ghafur', 'The Ever-Forgiving'],
  ['الشَّكُورُ', 'Ash-Shakur', 'The Most Appreciative'],
  ['الْعَلِيُّ', "Al-'Ali", 'The Most High'],
  ['الْكَبِيرُ', 'Al-Kabir', 'The Most Great'],
  ['الْحَفِيظُ', 'Al-Hafiz', 'The Preserver'],
  ['الْمُقِيتُ', 'Al-Muqit', 'The Sustainer'],
  ['الْحَسِيبُ', 'Al-Hasib', 'The Reckoner'],
  ['الْجَلِيلُ', 'Al-Jalil', 'The Majestic'],
  ['الْكَرِيمُ', 'Al-Karim', 'The Most Generous'],
  ['الرَّقِيبُ', 'Ar-Raqib', 'The Watchful'],
  ['الْمُجِيبُ', 'Al-Mujib', 'The Responsive'],
  ['الْوَاسِعُ', "Al-Wasi'", 'The All-Encompassing'],
  ['الْحَكِيمُ', 'Al-Hakim', 'The All-Wise'],
  ['الْوَدُودُ', 'Al-Wadud', 'The Most Loving'],
  ['الْمَجِيدُ', 'Al-Majid', 'The Glorious'],
  ['الْبَاعِثُ', "Al-Ba'ith", 'The Resurrector'],
  ['الشَّهِيدُ', 'Ash-Shahid', 'The Witness'],
  ['الْحَقُّ', 'Al-Haqq', 'The Absolute Truth'],
  ['الْوَكِيلُ', 'Al-Wakil', 'The Trustee'],
  ['الْقَوِيُّ', 'Al-Qawiyy', 'The All-Strong'],
  ['الْمَتِينُ', 'Al-Matin', 'The Firm, The Steadfast'],
  ['الْوَلِيُّ', 'Al-Waliyy', 'The Protecting Friend'],
  ['الْحَمِيدُ', 'Al-Hamid', 'The Praiseworthy'],
  ['الْمُحْصِي', 'Al-Muhsi', 'The Accounter'],
  ['الْمُبْدِئُ', "Al-Mubdi'", 'The Originator'],
  ['الْمُعِيدُ', "Al-Mu'id", 'The Restorer'],
  ['الْمُحْيِي', 'Al-Muhyi', 'The Giver of Life'],
  ['الْمُمِيتُ', 'Al-Mumit', 'The Bringer of Death'],
  ['الْحَيُّ', 'Al-Hayy', 'The Ever-Living'],
  ['الْقَيُّومُ', 'Al-Qayyum', 'The Self-Subsisting'],
  ['الْوَاجِدُ', 'Al-Wajid', 'The Finder'],
  ['الْمَاجِدُ', 'Al-Majid', 'The Noble'],
  ['الْوَاحِدُ', 'Al-Wahid', 'The One'],
  ['الْأَحَدُ', 'Al-Ahad', 'The Unique'],
  ['الصَّمَدُ', 'As-Samad', 'The Eternal, The Self-Sufficient'],
  ['الْقَادِرُ', 'Al-Qadir', 'The All-Able'],
  ['الْمُقْتَدِرُ', 'Al-Muqtadir', 'The Omnipotent'],
  ['الْمُقَدِّمُ', 'Al-Muqaddim', 'The Expediter'],
  ['الْمُؤَخِّرُ', "Al-Mu'akhkhir", 'The Delayer'],
  ['الْأَوَّلُ', 'Al-Awwal', 'The First'],
  ['الْآخِرُ', 'Al-Akhir', 'The Last'],
  ['الظَّاهِرُ', 'Az-Zahir', 'The Manifest'],
  ['الْبَاطِنُ', 'Al-Batin', 'The Hidden'],
  ['الْوَالِي', 'Al-Wali', 'The Governor'],
  ['الْمُتَعَالِي', "Al-Muta'ali", 'The Self-Exalted'],
  ['الْبَرُّ', 'Al-Barr', 'The Source of All Goodness'],
  ['التَّوَّابُ', 'At-Tawwab', 'The Ever-Pardoning'],
  ['الْمُنْتَقِمُ', 'Al-Muntaqim', 'The Avenger'],
  ['الْعَفُوُّ', "Al-'Afuww", 'The Pardoner'],
  ['الرَّءُوفُ', "Ar-Ra'uf", 'The Most Compassionate'],
  ['مَالِكُ الْمُلْكِ', 'Malik al-Mulk', 'Master of the Kingdom'],
  ['ذُو الْجَلَالِ وَالْإِكْرَامِ', 'Dhul-Jalali wal-Ikram', 'Lord of Majesty and Generosity'],
  ['الْمُقْسِطُ', 'Al-Muqsit', 'The Equitable'],
  ['الْجَامِعُ', "Al-Jami'", 'The Gatherer'],
  ['الْغَنِيُّ', 'Al-Ghani', 'The Self-Sufficient'],
  ['الْمُغْنِي', 'Al-Mughni', 'The Enricher'],
  ['الْمَانِعُ', "Al-Mani'", 'The Preventer'],
  ['الضَّارُّ', 'Ad-Darr', 'The Afflicter'],
  ['النَّافِعُ', "An-Nafi'", 'The Benefiter'],
  ['النُّورُ', 'An-Nur', 'The Light'],
  ['الْهَادِي', 'Al-Hadi', 'The Guide'],
  ['الْبَدِيعُ', "Al-Badi'", 'The Incomparable Originator'],
  ['الْبَاقِي', 'Al-Baqi', 'The Everlasting'],
  ['الْوَارِثُ', 'Al-Warith', 'The Inheritor'],
  ['الرَّشِيدُ', 'Ar-Rashid', 'The Guide to the Right Path'],
  ['الصَّبُورُ', 'As-Sabur', 'The Most Patient']
];

export const ARTICLES = [
  {
    id: 'a1',
    title: 'The Five Pillars of Islam',
    summary: 'The foundation on which the life of every Muslim is built.',
    body:
      'The Prophet ﷺ said: "Islam is built upon five."\n\n1. Shahadah - the testimony that there is no god but Allah and that Muhammad ﷺ is His Messenger.\n2. Salah - the five daily prayers: Fajr, Dhuhr, Asr, Maghrib and Isha.\n3. Zakat - the obligatory annual charity of 2.5% on qualifying wealth held for a lunar year.\n4. Sawm - fasting the month of Ramadan from Fajr to Maghrib.\n5. Hajj - the pilgrimage to Makkah once in a lifetime for those who are able.\n\nEach pillar is an act of worship that shapes character, discipline and gratitude.'
  },
  {
    id: 'a2',
    title: 'The Six Pillars of Iman',
    summary: 'What a Muslim believes in the heart.',
    body:
      'Faith (iman) comprises belief in:\n\n1. Allah - the One, unique, without partner or equal.\n2. His angels - created from light, who carry out His commands.\n3. His books - including the Qur\u2019an, the final revelation preserved unchanged.\n4. His messengers - from Adam to Muhammad ﷺ.\n5. The Last Day - resurrection, reckoning and accountability.\n6. Divine decree - the good and the bad, while a person still chooses and acts.\n\nBelief is confirmed by the tongue and demonstrated through action.'
  },
  {
    id: 'a3',
    title: 'How to Perform Wudu',
    summary: 'The ablution required before prayer.',
    body:
      '1. Intend purification and say Bismillah.\n2. Wash both hands three times.\n3. Rinse the mouth three times.\n4. Sniff water into the nose and blow it out three times.\n5. Wash the face three times, from forehead to chin, ear to ear.\n6. Wash the arms to the elbows three times, right then left.\n7. Wipe the head once with wet hands, then the ears.\n8. Wash the feet to the ankles three times, right then left.\n\nWudu is broken by using the toilet, passing wind, and deep sleep. Water is not always needed: dry ablution (tayammum) is permitted when water is unavailable or harmful.'
  },
  {
    id: 'a4',
    title: 'How to Pray Salah',
    summary: 'The steps of a complete unit of prayer.',
    body:
      '1. Face the Qibla and intend the specific prayer.\n2. Say "Allahu Akbar" (takbir) to begin.\n3. Recite Al-Fatihah, then a passage of the Qur\u2019an.\n4. Bow (ruku\') saying "Subhana Rabbiyal-\'Azim".\n5. Rise saying "Sami\'allahu liman hamidah", then "Rabbana wa lakal-hamd".\n6. Prostrate (sujud) saying "Subhana Rabbiyal-A\'la".\n7. Sit between the two prostrations.\n8. Prostrate a second time.\n\nA rak\'ah consists of these steps once. Fajr has 2 rak\'at, Dhuhr 4, Asr 4, Maghrib 3 and Isha 4. The prayer closes with the tashahhud and tasleem.\n\nRIFQ Muslim uses your GPS position to show prayer times and the Qibla direction for your exact location.'
  },
  {
    id: 'a5',
    title: 'Understanding Zakat',
    summary: 'Who pays, on what, and how much.',
    body:
      'Zakat is due on wealth that reaches the nisab (the minimum threshold) and has been held for one lunar year.\n\nThe nisab is commonly measured as either 87.48 grams of gold or 612.36 grams of silver. Silver is often used because it is lower and therefore more inclusive.\n\nThe rate is 2.5% of qualifying wealth: cash, savings, gold and silver, trade goods and investments, plus money owed to you that you expect to be repaid. Debts you must pay are deducted.\n\nZakat is given to the eight categories named in the Qur\u2019an (9:60), including the poor, the needy and those in debt. Use the Zakat calculator in this app with your local gold or silver price.'
  },
  {
    id: 'a6',
    title: 'A Guide to Ramadan',
    summary: 'Fasting, suhoor, iftar and the last ten nights.',
    body:
      'Fasting begins at Fajr (suhoor ends) and ends at Maghrib (iftar). RIFQ Muslim computes both from your coordinates and timezone.\n\nSunnah of the day: wake for suhoor, delay it, break the fast promptly, and use the dua for breaking the fast.\n\nIncrease the Qur\u2019an, charity and night prayer, especially in the last ten nights when Laylat al-Qadr is sought.\n\nThose who are ill, travelling, pregnant, breastfeeding or menstruating have concessions; make up missed days or feed the needy as applicable.\n\nUse the Ramadan screen for a 30-day timetable and the Tracker for daily worship.'
  },
  {
    id: 'a7',
    title: 'The Hajj Journey',
    summary: 'The rites of pilgrimage in order.',
    body:
      'Hajj is performed in Dhul Hijjah:\n\n1. Ihram - enter the sacred state with intention, before the miqat.\n2. Tawaf - seven circuits of the Kaaba.\n3. Sa\'i - seven walks between Safa and Marwah.\n4. 8th Dhul Hijjah - travel to Mina.\n5. 9th - the day of Arafah, the essential rite, standing in supplication until sunset.\n6. Muzdalifah - night under the open sky.\n7. 10th - Jamarat (stoning), sacrifice, shaving or trimming, then Tawaf al-Ifadah.\n8. 11th-12th - stone the three pillars after noon.\n9. Tawaf al-Wada\' - the farewell circuit before leaving.\n\nUmrah is shorter: ihram, tawaf, sa\'i, and trimming. See the Hajj guide screen for each step.'
  },
  {
    id: 'a8',
    title: 'Daily Sunnah Checklist',
    summary: 'Small habits with lasting reward.',
    body:
      'Morning and evening adhkar.\nPray the five prayers in their time, preferably in congregation.\nRecite a portion of the Qur\u2019an daily - even a page.\nSunnah and witr prayers.\nSeek forgiveness 100 times a day.\nSend salawat upon the Prophet ﷺ.\nGive charity, even a little.\nMaintain family ties.\nSmile and speak kindly.\nSleep and wake with the sunnah duas.\n\nUse the Worship tracker to keep these consistent; the Prophet ﷺ loved consistent deeds, even small ones.'
  }
];

export const HAJJ_STEPS = [
  {
    id: 'j1',
    title: '1. Ihram and intention',
    detail:
      'Enter the state of ihram at or before the miqat: perform wudu, wear the garments (two white sheets for men; modest dress for women), and make the intention for Hajj or Umrah. Recite the talbiyah frequently: "Labbayk Allahumma labbayk..."',
    dua: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ'
  },
  {
    id: 'j2',
    title: '2. Tawaf of the Kaaba',
    detail:
      'Enter Masjid al-Haram and begin seven circuits of the Kaaba, starting at the Black Stone, keeping it on your left. Men uncover the right shoulder and walk briskly in the first three circuits.',
    dua: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ'
  },
  {
    id: 'j3',
    title: '3. Sa\u2019i between Safa and Marwah',
    detail: 'Walk seven times between Safa and Marwah, starting at Safa. Men jog between the green markers. This completes Umrah.',
    dua: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ'
  },
  {
    id: 'j4',
    title: '4. Mina - 8th Dhul Hijjah',
    detail: 'Travel to Mina, pray Dhuhr, Asr, Maghrib, Isha and the next Fajr there, shortening the four-rak\u2019ah prayers but not combining them.',
    dua: ''
  },
  {
    id: 'j5',
    title: '5. Arafah - 9th Dhul Hijjah',
    detail:
      'The essential rite. Stand at Arafah from noon until sunset in supplication, praying Dhuhr and Asr together. Whoever misses Arafah has missed Hajj.',
    dua: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ'
  },
  {
    id: 'j6',
    title: '6. Muzdalifah',
    detail: 'After sunset move to Muzdalifah, pray Maghrib and Isha together, rest, and pray Fajr. Collect pebbles if you wish.',
    dua: ''
  },
  {
    id: 'j7',
    title: '7. Jamarat and sacrifice - 10th Dhul Hijjah',
    detail:
      'Stone the large pillar (Jamrat al-Aqabah) with seven pebbles saying "Allahu Akbar" with each throw, then sacrifice, shave or trim, and remove ihram.',
    dua: 'اللَّهُ أَكْبَرُ'
  },
  {
    id: 'j8',
    title: '8. Tawaf al-Ifadah',
    detail: 'Return to Makkah for the essential tawaf of Hajj, seven circuits, then Sa\u2019i if required for your type of Hajj.',
    dua: ''
  },
  {
    id: 'j9',
    title: '9. Mina days - 11th to 12th',
    detail: 'Stay in Mina and stone the three pillars after noon each day, smallest to largest, seven pebbles each.',
    dua: 'اللَّهُ أَكْبَرُ'
  },
  {
    id: 'j10',
    title: '10. Tawaf al-Wada\u2019',
    detail: 'The farewell tawaf before leaving Makkah, seven circuits without sa\u2019i.',
    dua: ''
  }
];

export const TASBIH_PRESETS = [
  { id: 't1', label: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33, meaning: 'Glory be to Allah' },
  { id: 't2', label: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33, meaning: 'All praise is for Allah' },
  { id: 't3', label: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 34, meaning: 'Allah is the Greatest' },
  { id: 't4', label: 'La ilaha illallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100, meaning: 'There is no god but Allah' },
  { id: 't5', label: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 100, meaning: 'I seek Allah\u2019s forgiveness' },
  { id: 't6', label: 'Salawat', arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ', target: 100, meaning: 'Blessings upon the Prophet ﷺ' }
];

export const DAILY_VERSES = [
  { surah: 2, ayah: 286, text: 'Allah does not burden a soul beyond what it can bear.' },
  { surah: 94, ayah: 6, text: 'Indeed, with hardship comes ease.' },
  { surah: 13, ayah: 28, text: 'Verily, in the remembrance of Allah do hearts find rest.' },
  { surah: 65, ayah: 3, text: 'And whoever relies upon Allah - then He is sufficient for him.' },
  { surah: 2, ayah: 152, text: 'So remember Me; I will remember you.' },
  { surah: 39, ayah: 53, text: 'Do not despair of the mercy of Allah.' },
  { surah: 3, ayah: 139, text: 'Do not lose hope, nor be sad.' },
  { surah: 55, ayah: 13, text: 'So which of the favours of your Lord would you deny?' },
  { surah: 17, ayah: 80, text: 'My Lord, cause me to enter a sound entrance and to exit a sound exit.' },
  { surah: 25, ayah: 74, text: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes.' }
];
