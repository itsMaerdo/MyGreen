/* ============================================================
   moments-config.js — BURAYI SEN DOLDUR
   Zamanları ?dev=1 ile açılan "zaman yakalama" panelinden alırsın.
   ============================================================ */

window.FEATURES_CONFIG = {

  // "yavrum" yazısına kaç tıkta panel açılsın (2.5 sn içinde art arda)
  secretClicks: 7,

  // Daktilo hızı
  typeMsPerChar: 28,        // her harf arası (ms)
  sentencePauseBase: 400,   // cümle sonu sabit bekleme (ms)
  pausePerWord: 90,         // cümledeki kelime başına ek bekleme (ms)

  // Şarkı anı tuşunun yazısı
  buttonLabel: "Sana",

  // Son söz bittikten sonra ekranın kararmış kalacağı süre (sn)
  outroHold: 1.4,

  moments: [
    // ÖRNEK ŞABLON — zamanları doldurunca otomatik aktif olur.
    // (Sayı girilmemiş / boş metinli anlar yok sayılır.)
    {
      id: "ifnotforyou",
      track: "musics/mus1.mp3",   // musicFiles'taki path ile birebir aynı olmalı

      buttonAt: 82.00,             // tuşun belireceği saniye
      // lines[0].at = ilk sözün başladığı saniye → tuş tam o an kaybolur
      lines: [
        { at: 92.26, text: "How could i wake up?"},   // satır 1
        { at: 94.85, text: "How could i Sleep?" },   // satır 2
        { at: 97.3, text: "How could i be" },   // ...
        { at: 99.45, text: "Someone?"},   // ...
        { at: 102.5, text: "All those crowds" },   // ...
        { at: 105.1, text: "All the music would" },   // ...
        { at: 107.6, text: "Just" },   // ...
        { at: 108.8, text: "Fade" },   // ...
        { at: 110.45, text: "Out" },   // ...
        { at: 112.8, text: "Not" },   // ..
        { at: 114.8, text: "A sound" },   // ..
        { at: 119.2, text: "If not for", emph: true },   // emph: true → vurgulu satır (büyük + patlama efekti)
        { at: 120.52, text: "Youuuu...", emph: true }
      ],
      end: 121.3,                  // son sözün bittiği saniye

      note: {                     // animasyon bitince açılan not
        title: "ifnotforyou.txt",
        text: "Bu siteyi sana değil de kime yapabilirim sevgilim? \nHer gördüğüm sevgi dolu reelsları, her sabah yazdığım uzun günaydın mesajlarını sana değil de kime atabilirim? \nBütün sevgimi, bütün aşkımı senin dışında kime gösterebilirim? \nBu kalbi sana değil de başka kime veririm sevgilim? \nBelki bazen attığım reelslarla ya da uzun mesajlarla biraz fazla sıkıyor olabilirim seni ama sana karşı kendimi tutamıyorum. Başkalarıyla konuşmak istemediğim anlarda bile yaptığım her şeyi, sana olan bütün sevgimi uzun uzun anlatmak istiyorum. Benim için çok değerlisin bebeğim. \n1c"
      }
    },

    {
      id: "iloveyou",
      track: "musics/mus2.mp3",   // musicFiles'taki path ile birebir aynı olmalı

      buttonAt: 67,             // tuşun belireceği saniye
      // lines[0].at = ilk sözün başladığı saniye → tuş tam o an kaybolur
      lines: [
        { at: 84, text: "I"},   // satır 1
        { at: 84.6, text: "Love"},
        { at: 85.2, text: "You"},
        { at: 85.5, text: "Baby"},
        { at: 86.7, text: "And if it's quite alright"},
        { at: 88.5, text: "I need you baby"},
        { at: 90.2, text: "To warm the lonely nights"},
        { at: 92.3, text: "I love you baby"},
        { at: 94.5, text: "Trust in me when i say"},
        { at: 98.9, text: "Oh pretty baby"},
        { at: 101.4, text: "Dont bring me down i pray"},
        { at: 103.3, text: "Oh pretty baby"},
        { at: 105.1, text: "Now that i found you stay"},
        { at: 107.2, text: "Let me love"},
        { at: 108.5, text: "you baby"},
        { at: 110.3, text: "Let me"},
        { at: 111.2, text: "Love"},
        { at: 112, text: "Youuuu...", emph: true }
      ],
      end: 113,                  // son sözün bittiği saniye

      note: {                     // animasyon bitince açılan not
        title: "iloveyou.txt",
        text: "O kadar güzelsin ki senin yanında bütün manzaralar sönük kalır, çiçekler senin yanında açmaya utanır. Güzelliğin karşısında zaman bile akmayı unutur. \nGenelde benden önce uyuyorsun. Ben seni özlediğimde, bazı şeyleri fazla düşünüp stres olduğumda ya da sadece ne kadar güzel olduğunu hatırlamak istediğimde fotoğraflarına bakıp hayallere dalıyorum. Sadece tatlı fotoğraflarınla bile beni sakinleştirebiliyorsun sevgilim. \nBu dediğime inanmıyorsun gibi geliyor ama gördüğüm ve göreceğim en güzel kızsın. Güzelliğinin tarifi benim için bir insanınkiyle asla kıyaslanamaz. İnanmasan da defalarca söyledim, defalarca da söylemeye devam edeceğim. Sen benim için dünyanın en güzel kızısın ve hep öyle kalacaksın. \n06"
      }
    },

       {
      id: "iwannabeyours",
      track: "musics/mus3.mp3",   // musicFiles'taki path ile birebir aynı olmalı

      buttonAt: 140,             // tuşun belireceği saniye
      // lines[0].at = ilk sözün başladığı saniye → tuş tam o an kaybolur
      lines: [
        { at: 146, text: "I wanna be your"},   // satır 1
        { at: 147, text: "Vacuum cleaner"},   // satır 1
        { at: 149.8, text: "Breathin'in your dust"},   // satır 1
        { at: 153.2, text: "I wanna be your"},   // satır 1
        { at: 154.2, text: "Ford Cortina"},   // satır 1
        { at: 157, text: "I will never rust"},   // satır 1
        { at: 159.6, text: "I just wanna be yours", emph: true },   // satır 1
        { at: 163.1, text: "I just wanna be yours", emph: true },   // satır 1
        { at: 166.6, text: "I just wanna be yours", emph: true }   // satır 1
      ],
      end: 170,                  // son sözün bittiği saniye

      note: {                     // animasyon bitince açılan not
        title: "iwannebeyours.txt",
        text: "Şarkıda da söylediği gibi, ne olursa olsun sadece senin olmak istiyorum. Kalbimle, sevgimle, her şeyimle sadece senin. \n2a"
      }
    }
  ]
};
