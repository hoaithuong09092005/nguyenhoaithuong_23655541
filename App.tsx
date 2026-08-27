// TH1 | 23655541 | NGUYEN HOAI THUONG | #596255

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { STUDENT, examStamp, VARIANT, FLASH_SECONDS, BANNER_IMAGE_ID } from './src/constants/student';
import { fetchProducts, Product } from './src/services/productApi';
import { useCountdown } from './src/hooks/useCountdown';
import { OrderModal } from './src/components/OrderModal';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar
        {...({
          barStyle: isDarkMode ? 'light-content' : 'dark-content',
          backgroundColor: isDarkMode ? '#042F2E' : '#F0FDFA',
        } as any)}
      />
      <AppContent isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </SafeAreaProvider>
  );
}

interface AppContentProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

function AppContent({ isDarkMode, setIsDarkMode }: AppContentProps) {
  const safeAreaInsets = useSafeAreaInsets();
  
  // States for products fetch
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Tất cả' | 'Đồ ăn' | 'Nước' | 'Học tập'>('Tất cả');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Countdown timer hook
  const { formattedTime, isTimeUp } = useCountdown(FLASH_SECONDS);

  // Fetch products on mount
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Không tải được dữ liệu món.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Theme colors mapping
  const colors = {
    background: isDarkMode ? '#042F2E' : '#F0FDFA',
    surface: isDarkMode ? '#0B4F4A' : '#FFFFFF',
    text: isDarkMode ? '#F0FDFA' : '#134E4A',
    textLight: isDarkMode ? '#A5F3FC' : '#5F7A77',
    primary: '#07766E',
    border: isDarkMode ? '#115E59' : '#CCFBF1',
    error: '#DC2626',
    secondary: '#F59E0B',
  };

  // Watermark text details
  const stamp = examStamp();
  const watermarkText = `TH1 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${stamp}`;

  // Chips configuration
  const baseChips: ('Học tập' | 'Nước' | 'Đồ ăn' | 'Tất cả')[] = ['Tất cả', 'Đồ ăn', 'Nước', 'Học tập'];
  const chipsList = VARIANT.chipsReversed ? [...baseChips].reverse() : baseChips;

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Tất cả' || product.category === selectedCategory;
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenOrder = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  // 1. Loading State Screen
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải món...</Text>
      </View>
    );
  }

  // 2. Error State Screen
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingHorizontal: 30 }]}>
        <Text style={[styles.errorMssv, { color: colors.error }]}>{STUDENT.mssv}</Text>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.retryBtn,
            { backgroundColor: colors.error, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={loadProducts}
        >
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  // 3. Success State Screen
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
        },
      ]}
    >
      {/* Watermark position at TOP if watermarkAtTop is true */}
      {VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainerTop}>
          <Text style={[styles.watermarkText, { color: colors.textLight }]}>
            {watermarkText}
          </Text>
        </View>
      )}

      {/* Header Teal Block */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>CAMPUSMART</Text>
          <Text style={styles.headerSlogan}>Tiện lợi KTX</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Sáng/Tối theme toggler - Pressable button for MSSV end digit 1 */}
          <Pressable
            style={({ pressed }) => [
              styles.themeToggleBtn,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={styles.themeToggleText}>Sáng / Tối</Text>
          </Pressable>
          <Text style={[styles.countdownText, { color: colors.secondary }]}>
            Flash {formattedTime}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Search Input (ShopInput) */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.searchIcon, { color: colors.textLight }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Tìm món, nước, đồ dùng — ${STUDENT.mssv}`}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: `https://picsum.photos/id/${BANNER_IMAGE_ID}/800/320` }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Đặt nhanh · Nhận tại quầy</Text>
            <Text style={styles.bannerSubtitle}>Cửa hàng tiện lợi ktx 24/7</Text>
          </View>
        </View>

        {/* Category Chips Selector */}
        <View style={styles.chipsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={chipsList}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipsContent}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item;
              return (
                <Pressable
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Product Items FlatList */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => `${STUDENT.mssv}-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                Không có món phù hợp
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.productCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              onPress={() => handleOpenOrder(item)}
            >
              {/* Product Image */}
              <View style={styles.productImageContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.productPrice, { color: colors.primary }]}>
                  {item.displayPrice}
                </Text>
                <Text style={[styles.productCategory, { color: colors.textLight }]}>
                  {item.category}
                </Text>
              </View>

              {/* Order Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.orderBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => handleOpenOrder(item)}
              >
                <Text style={styles.orderBtnText}>Đặt</Text>
              </Pressable>
            </Pressable>
          )}
        />
      </View>

      {/* Watermark position at BOTTOM if watermarkAtTop is false */}
      {!VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainerBottom}>
          <Text style={[styles.watermarkText, { color: colors.textLight }]}>
            {watermarkText}
          </Text>
        </View>
      )}

      {/* Placing Order Modal Dialog */}
      <OrderModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => {
          setModalVisible(false);
          setSelectedProduct(null);
        }}
        isTimeUp={isTimeUp}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  errorMssv: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSlogan: {
    fontSize: 12,
    color: '#CCFBF1',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  themeToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
  },
  themeToggleText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  bannerContainer: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 118, 110, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: '#E6FFFA',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  chipsContainer: {
    marginBottom: 10,
  },
  chipsContent: {
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  productImageContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  productCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  orderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  orderBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  watermarkContainerTop: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  watermarkContainerBottom: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default App;
