#!/bin/sh
# Скачивает фото, сертификаты и отзывы с glassproject.kz в ~/Desktop/glass-assets и пакует в glass-assets.zip
set -e
mkdir -p ~/Desktop/glass-assets && cd ~/Desktop/glass-assets
n=0; while read -r u; do [ -z "$u" ] && continue; n=$((n+1)); printf "%s " "$n"; curl -fsSLO --retry 2 -A "Mozilla/5.0" "$u" || echo "FAIL $u"; done <<'EOF'
https://glassproject.kz/wp-content/uploads/elementor/thumbs/AnyConv.com__logo101-scaled-qa1nfdohb25z1cqqvzoeunelt3a6u54afqp6bh60iu.webp
https://glassproject.kz/wp-content/uploads/2023/05/cropped-AnyConv.com__logo-270x270.webp
https://glassproject.kz/wp-content/uploads/2023/06/d12-1024x1024.jpg
https://glassproject.kz/wp-content/uploads/elementor/thumbs/AnyConv.com__kaspi_logo-1_cleanup-removebg-preview-1-q9nj80wzw0at2vhlrpneue11vo0bp5ndcfy7f96way.webp
https://glassproject.kz/wp-content/uploads/2024/07/vhodnaya-gruppa-seti-kafe-baselic.jpg
https://glassproject.kz/wp-content/uploads/2024/07/igorno-gostinichnyj-kompleks-v-g-konaev.jpg
https://glassproject.kz/wp-content/uploads/2023/07/AnyConv.com__zimniy_sad.webp
https://glassproject.kz/wp-content/uploads/2023/07/AnyConv.com__d30.webp
https://glassproject.kz/wp-content/uploads/2023/07/AnyConv.com__photo_5247188569913676752_y-1-1.webp
https://glassproject.kz/wp-content/uploads/2023/07/photo_5327866141839839143_y.webp
https://glassproject.kz/wp-content/uploads/2023/06/photo_5451831409242129242_y.jpg
https://glassproject.kz/wp-content/uploads/2023/07/AnyConv.com__photo_5438238752578325206_y-1.webp
https://glassproject.kz/wp-content/uploads/2023/06/photo_5445096848982395208_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5445096848982395206_y-2.jpg
https://glassproject.kz/wp-content/uploads/2023/07/AnyConv.com__photo_5206632258889436895_y.webp
https://glassproject.kz/wp-content/uploads/2023/06/d11.jpg
https://glassproject.kz/wp-content/uploads/2023/06/d16.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325230_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325215_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325239_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325224_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325197_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325200_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325199_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325209_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325212_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325228_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325227_y.jpg
https://glassproject.kz/wp-content/uploads/2024/05/AnyConv.com__photo_5438238752578325201_y.webp
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325216_y.jpg
https://glassproject.kz/wp-content/uploads/2023/06/photo_5438238752578325221_y.jpg
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s1.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s2.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s3.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s4.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s5.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s6.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s7.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s8.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s9.webp
https://glassproject.kz/wp-content/uploads/2023/05/AnyConv.com__s10.webp
https://glassproject.kz/wp-content/uploads/2023/06/AnyConv.com__%D0%9E%D1%82%D0%B7%D1%8B%D0%B2-1.webp
https://glassproject.kz/wp-content/uploads/2023/06/AnyConv.com__%D0%9E%D1%82%D0%B7%D1%8B%D0%B2-2.webp
https://glassproject.kz/wp-content/uploads/2023/06/AnyConv.com__%D0%9E%D1%82%D0%B7%D1%8B%D0%B2-3.webp
https://glassproject.kz/wp-content/uploads/2023/06/AnyConv.com__%D0%9E%D1%82%D0%B7%D1%8B%D0%B2-5.webp
EOF
echo
cd ~/Desktop && rm -f glass-assets.zip && zip -qr glass-assets.zip glass-assets && ls -lh glass-assets.zip && open -R glass-assets.zip
