export const kotlinDashboardCode = `package ir.sabkhooneh.app.ui.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import kotlinx.coroutines.launch

// کلاس‌های داده برای مدل‌های شبیه‌ساز داشبورد صابخونه
data class ChoreTurn(
    val id: Int,
    val name: String,
    val date: String,
    val tasks: List<String>,
    val isMe: Boolean = false
)

data class RoommateRank(
    val rank: Int,
    val name: String,
    val points: Int,
    val completedCount: Int,
    val transferCount: Int,
    val isMe: Boolean = false
)

data class HistoryItem(
    val id: Int,
    val name: String,
    val date: String,
    val taskType: String,
    val isCompleted: Boolean = true
)

data class CartableRequest(
    val id: Int,
    val name: String,
    val type: String,
    val details: String,
    var status: String // pending, approved, rejected
)

data class WhitelistPhone(
    val phone: String,
    val namePlaceholder: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainTabScaffold(
    roomNumber: String = "اتاق ۴۰۲",
    roomCode: String = "SAB402",
    todayPersianDate: String = "پنج‌شنبه ۱۲ تیر ۱۴۰۵",
    userName: String = "محمد دلیری",
    userEmail: String = "mahdi@sabkhooneh.ir",
    userRole: String = "شهردار", // شهردار یا شهروند
    totalPoints: Int = 185,
    postponeCount: Int = 2
) {
    // تم رنگی برند لوکس صابخونه
    val primaryColor = Color(0xFF4F46E5) // Indigo 600
    val backgroundColor = Color(0xFFF8FAFC) // Slate 50

    var selectedTab by remember { mutableStateOf(0) } // بستگی به نقش دارد

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                ModalDrawerSheet(
                    modifier = Modifier.width(280.dp),
                    drawerContainerColor = Color.White
                ) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "امکانات صابخونه",
                        modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        color = primaryColor
                    )
                    Divider(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                    
                    NavigationDrawerItem(
                        label = { Text("✈️ تنظیمات سفر هم‌اتاقی‌ها", fontWeight = FontWeight.Bold, fontSize = 13.sp) },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                        },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )

                    NavigationDrawerItem(
                        label = { Text("🚨 درخواست کار اضافه", fontWeight = FontWeight.Bold, fontSize = 13.sp) },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                        },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )

                    NavigationDrawerItem(
                        label = { Text("👑 ورود به پنل شهردار", fontWeight = FontWeight.Bold, fontSize = 13.sp) },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                        },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }
        ) {
            Scaffold(
                topBar = {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color.White,
                        shadowElevation = 2.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .statusBarsPadding()
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            IconButton(onClick = {
                                scope.launch { drawerState.open() }
                            }) {
                                Icon(
                                    imageVector = Icons.Default.Menu,
                                    contentDescription = "منوی کاربری",
                                    tint = Color(0xFF0F172A),
                                    modifier = Modifier.size(24.dp)
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = if (userRole == "شهردار") {
                                        when (selectedTab) {
                                            0 -> "کارتابل شهردار"
                                            1 -> "اعلان‌های رسمی"
                                            2 -> "مدیریت هم‌اتاقی‌ها"
                                            else -> "تاریخچه جامع"
                                        }
                                    } else {
                                        when (selectedTab) {
                                            0 -> roomNumber
                                            1 -> "رده‌بندی امتیازات"
                                            2 -> "تاریخچه نظافت"
                                            else -> "پروفایل کاربری"
                                        }
                                    },
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A),
                                    maxLines = 1
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = todayPersianDate,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF64748B),
                                    maxLines = 1
                                )
                            }
                        }
                    }
                },
                bottomBar = {
                    NavigationBar(
                        containerColor = Color.White,
                        tonalElevation = 8.dp,
                        modifier = Modifier.navigationBarsPadding()
                    ) {
                        val isMayor = userRole == "شهردار"
                        val items = if (isMayor) {
                            listOf("کارتابل", "اعلان‌ها", "مدیریت", "تاریخچه")
                        } else {
                            listOf("خانه", "امتیازات", "تاریخچه", "پروفایل")
                        }
                        val icons = if (isMayor) {
                            listOf(
                                Icons.Default.Email,
                                Icons.Default.Notifications,
                                Icons.Default.Settings,
                                Icons.Default.List
                            )
                        } else {
                            listOf(
                                Icons.Default.Home,
                                Icons.Default.Star,
                                Icons.Default.DateRange,
                                Icons.Default.Person
                            )
                        }

                        items.forEachIndexed { index, label ->
                            NavigationBarItem(
                                selected = selectedTab == index,
                                onClick = { selectedTab = index },
                                label = {
                                    Text(
                                        text = label,
                                        fontSize = 10.sp,
                                        fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                                        maxLines = 1
                                    )
                                },
                                icon = {
                                    Icon(
                                        imageVector = icons[index],
                                        contentDescription = label,
                                        modifier = Modifier.size(22.dp)
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = primaryColor,
                                    selectedTextColor = primaryColor,
                                    unselectedIconColor = Color(0xFF94A3B8),
                                    unselectedTextColor = Color(0xFF94A3B8),
                                    indicatorColor = Color(0xFFEEF2F6)
                                )
                            )
                        }
                    }
                },
                containerColor = backgroundColor
            ) { paddingValues ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    if (userRole == "شهردار") {
                        when (selectedTab) {
                            0 -> MayorCartableTabScreen()
                            1 -> MayorAnnouncementTabScreen()
                            2 -> MayorManagePointsTabScreen(roomCode)
                            3 -> MayorHistoryTabScreen()
                        }
                    } else {
                        when (selectedTab) {
                            0 -> HomeChoreTabScreen()
                            1 -> LeaderboardTabScreen()
                            2 -> HistoryTabScreen()
                            3 -> ProfileTabScreen(userName, userEmail, userRole, totalPoints, postponeCount)
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// ۱. تب اول شهروند: خانه و مدیریت نوبت امروز
// ==========================================
@Composable
fun HomeChoreTabScreen() {
    val primaryColor = Color(0xFF4F46E5)
    
    val futureTurns = remember {
        listOf(
            ChoreTurn(1, "پوریا حسینی", "جمعه ۱۳ تیر", listOf("🧹 جاروبرقی")),
            ChoreTurn(2, "محمد دلیری", "شنبه ۱۴ تیر", listOf("🗑️ زباله", "🧹 جاروبرقی"), isMe = true),
            ChoreTurn(3, "سهیل بهرامی", "یک‌شنبه ۱۵ تیر", listOf("🗑️ زباله"))
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { Spacer(modifier = Modifier.height(10.dp)) }

        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(8.dp, RoundedCornerShape(24.dp)),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                brush = Brush.horizontalGradient(
                                    colors = listOf(primaryColor, Color(0xFF8B5CF6))
                                ),
                                shape = RoundedCornerShape(100.dp)
                            )
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "نوبت امروز خوابگاه",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "محمد دلیری (شما)",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF1E1B4B)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = Color(0xFFFEF2F2),
                            shape = RoundedCornerShape(12.dp),
                            border = BoxStroke(1.dp, Color(0xFFFCA5A5)),
                            modifier = Modifier.padding(horizontal = 4.dp)
                        ) {
                            Text(
                                text = "🗑️ زباله",
                                color = Color(0xFFDC2626),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }

                        Surface(
                            color = Color(0xFFEFF6FF),
                            shape = RoundedCornerShape(12.dp),
                            border = BoxStroke(1.dp, Color(0xFFBFDBFE)),
                            modifier = Modifier.padding(horizontal = 4.dp)
                        ) {
                            Text(
                                text = "🧹 جاروبرقی",
                                color = Color(0xFF2563EB),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }
                }
            }
        }

        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = {},
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Text("انجام دادم", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text("انتقال به نفر بعد", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6B7280)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text("امروز نیاز نیست", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        item {
            Text(
                text = "نوبت‌های آینده خوابگاه",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A),
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        items(futureTurns) { turn ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .border(BoxStroke(1.dp, Color(0xFFF1F5F9)), RoundedCornerShape(16.dp))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(
                                if (turn.isMe) Color(0xFF4F46E5) else Color(0xFF94A3B8),
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(turn.name.take(1), color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Column {
                        Text(turn.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                        Text(turn.tasks.joinToString(" و "), fontSize = 10.sp, color = Color(0xFF64748B))
                    }
                }

                Text(turn.date, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4F46E5))
            }
        }
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

// ==========================================
// ۲. تب دوم شهروند: رده‌بندی امتیازات
// ==========================================
@Composable
fun LeaderboardTabScreen() {
    val primaryColor = Color(0xFF4F46E5)

    val ranks = remember {
        listOf(
            RoommateRank(1, "امیررضا علوی", 210, 18, 2),
            RoommateRank(2, "محمد دلیری", 185, 15, 1, isMe = true),
            RoommateRank(3, "پوریا حسینی", 160, 13, 3),
            RoommateRank(4, "سهیل بهرامی", 145, 11, 4),
            RoommateRank(5, "عرفان اسدی", 120, 9, 5)
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Spacer(modifier = Modifier.height(10.dp)) }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "پیشتازان مسئولیت‌پذیری هفته",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF475569)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Bottom
                        ) {
                            Text("🥈", fontSize = 20.sp)
                            Text("محمد دلیری", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF334155))
                            Spacer(modifier = Modifier.height(6.dp))
                            Box(
                                modifier = Modifier
                                    .width(55.dp)
                                    .height(65.dp)
                                    .background(Color(0xFFE2E8F0), RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("۱۸۵ امتیاز", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF475569))
                            }
                        }

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Bottom
                        ) {
                            Text("👑", fontSize = 22.sp)
                            Text("امیررضا علوی", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color(0xFF1E293B))
                            Spacer(modifier = Modifier.height(6.dp))
                            Box(
                                modifier = Modifier
                                    .width(65.dp)
                                    .height(90.dp)
                                    .background(
                                        brush = Brush.verticalGradient(
                                            colors = listOf(Color(0xFFFBBF24), Color(0xFFF59E0B))
                                        ),
                                        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("۲۱۰ امتیاز", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color.White)
                            }
                        }

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Bottom
                        ) {
                            Text("🥉", fontSize = 20.sp)
                            Text("پوریا حسینی", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF334155))
                            Spacer(modifier = Modifier.height(6.dp))
                            Box(
                                modifier = Modifier
                                    .width(55.dp)
                                    .height(45.dp)
                                    .background(Color(0xFFFFEDD5), RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("۱۶۰ امتیاز", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFFC2410C))
                            }
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "جدول رده‌بندی کل اتاق",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }

        items(ranks) { r ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(if (r.isMe) Color(0xFFEEF2F6) else Color.White, RoundedCornerShape(16.dp))
                    .border(
                        width = 1.dp,
                        color = if (r.isMe) primaryColor.copy(alpha = 0.4f) else Color(0xFFF1F5F9),
                        shape = RoundedCornerShape(16.dp)
                    )
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .background(
                                color = when (r.rank) {
                                    1 -> Color(0xFFF59E0B)
                                    2 -> Color(0xFF64748B)
                                    3 -> Color(0xFFB45309)
                                    else -> Color(0xFFCBD5E1)
                                },
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = r.rank.toString(),
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = r.name,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1E293B)
                            )
                            if (r.isMe) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "(شما)",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = primaryColor
                                )
                            }
                        }
                        
                        Text(
                            text = "انجام شده: \${r.completedCount} بار | انتقال داده شده: \${r.transferCount} بار",
                            fontSize = 10.sp,
                            color = Color(0xFF64748B)
                        )
                    }
                }

                Text(
                    text = "\${r.points} امتیاز",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black,
                    color = primaryColor
                )
            }
        }
        
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

// ==========================================
// ۳. تب سوم شهروند: تاریخچه نظافت
// ==========================================
@Composable
fun HistoryTabScreen() {
    val historyItems = remember {
        listOf(
            HistoryItem(1, "محمد دلیری", "پنج‌شنبه ۱۲ تیر", "زباله و جاروبرقی"),
            HistoryItem(2, "امیررضا علوی", "چهارشنبه ۱۱ تیر", "زباله"),
            HistoryItem(3, "سهیل بهرامی", "سه‌شنبه ۱۰ تیر", "جاروبرقی"),
            HistoryItem(4, "پوریا حسینی", "دوشنبه ۹ تیر", "زباله"),
            HistoryItem(5, "عرفان اسدی", "یک‌شنبه ۸ تیر", "زباله و جاروبرقی")
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Spacer(modifier = Modifier.height(10.dp)) }

        item {
            Text(
                text = "تاریخچه کارهای انجام شده اخیر",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }

        items(historyItems) { item ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .border(BoxStroke(1.dp, Color(0xFFF1F5F9)), RoundedCornerShape(16.dp))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(Color(0xFFECFDF5), shape = CircleShape)
                            .border(BoxStroke(1.dp, Color(0xFFA7F3D0)), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "انجام شد",
                            tint = Color(0xFF059669),
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    Column {
                        Text(
                            text = item.name,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "نوع کار: \${item.taskType}",
                            fontSize = 10.sp,
                            color = Color(0xFF64748B)
                        )
                    }
                }

                Text(
                    text = item.date,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF475569)
                )
            }
        }
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

// ==========================================
// ۴. تب چهارم شهروند: پروفایل کاربری
// ==========================================
@Composable
fun ProfileTabScreen(
    userName: String,
    userEmail: String,
    userRole: String,
    totalPoints: Int,
    postponeCount: Int
) {
    val primaryColor = Color(0xFF4F46E5)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        Spacer(modifier = Modifier.height(14.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(primaryColor, Color(0xFF8B5CF6))
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = userName.take(1),
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = userName,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = userEmail,
                    fontSize = 11.sp,
                    color = Color(0xFF64748B)
                )

                Spacer(modifier = Modifier.height(14.dp))

                Surface(
                    color = if (userRole == "شهردار") Color(0xFFECFDF5) else Color(0xFFFEF3C7),
                    shape = RoundedCornerShape(8.dp),
                    border = BoxStroke(
                        width = 1.dp,
                        color = if (userRole == "شهردار") Color(0xFF10B981) else Color(0xFFF59E0B)
                    )
                ) {
                    Text(
                        text = "نقش: \${userRole}",
                        color = if (userRole == "شهردار") Color(0xFF047857) else Color(0xFFB45309),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "🏆 کل امتیازات",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "\${totalPoints} امتیاز",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = primaryColor
                    )
                }

                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(40.dp)
                        .background(Color(0xFFE2E8F0))
                )

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "⏳ تعداد تعویق",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "\${postponeCount} مرتبه",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFDC2626)
                    )
                }
            }
        }

        Text(
            text = "نرم‌افزار مدیریت خوابگاه صابخونه • نسخه دانشجویی ۲.۴",
            fontSize = 9.sp,
            color = Color(0xFF94A3B8),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}


// ==========================================================
// 👑 صفحات مربوط به پنل اختصاصی شهردار (Mayor Admin Screens)
// ==========================================================

// ۱. کارتابل بررسی درخواست‌های هم‌اتاقی‌ها
@Composable
fun MayorCartableTabScreen() {
    val requests = remember {
        mutableStateListOf(
            CartableRequest(1, "پوریا حسینی", "✈️ ثبت سفر آخر هفته", "تاریخ خروج: ۱۴ تیر - بازگشت: ۱۶ تیر", "pending"),
            CartableRequest(2, "سهیل بهرامی", "🚨 درخواست کار اضافه", "درخواست نظافت مضاعف آشپزخانه برای دریافت ۱۵ امتیاز مثبت", "pending")
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Spacer(modifier = Modifier.height(10.dp)) }

        item {
            Text(
                text = "📥 کارتابل درخواست‌های هم‌اتاقی‌ها",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }

        if (requests.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "🎉 هیچ درخواست در انتظار بررسی وجود ندارد.",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF64748B)
                        )
                    }
                }
            }
        } else {
            items(requests) { req ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = req.name,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                            
                            Surface(
                                color = when (req.status) {
                                    "pending" -> Color(0xFFFFFBEB)
                                    "approved" -> Color(0xFFECFDF5)
                                    else -> Color(0xFFFEF2F2)
                                },
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(
                                    1.dp,
                                    when (req.status) {
                                        "pending" -> Color(0xFFFBBF24)
                                        "approved" -> Color(0xFF34D399)
                                        else -> Color(0xFFF87171)
                                    }
                                )
                            ) {
                                Text(
                                    text = when (req.status) {
                                        "pending" -> "در انتظار بررسی"
                                        "approved" -> "تایید شده"
                                        else -> "رد شده"
                                    },
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = when (req.status) {
                                        "pending" -> Color(0xFFB45309)
                                        "approved" -> Color(0xFF047857)
                                        else -> Color(0xFFB91C1C)
                                    },
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Text(
                            text = req.type,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF4F46E5)
                        )

                        Text(
                            text = req.details,
                            fontSize = 10.sp,
                            color = Color(0xFF64748B)
                        )

                        if (req.status == "pending") {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Button(
                                    onClick = { req.status = "rejected" },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF1F5F9)),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.padding(end = 8.dp).height(32.dp)
                                ) {
                                    Text("رد درخواست", color = Color(0xFF475569), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = { req.status = "approved" },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.height(32.dp)
                                ) {
                                    Text("تایید درخواست", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

// ۲. اعلان‌های رسمی اتاق
@Composable
fun MayorAnnouncementTabScreen() {
    val primaryColor = Color(0xFF4F46E5)
    var textInput by remember { mutableStateOf("") }
    val announcements = remember {
        mutableStateListOf(
            HistoryItem(1, "شهردار (محمد دلیری)", "امروز", "فردا جمعه نظافت کلی اتاق راس ساعت ۱۱ شروع می‌شود.")
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Spacer(modifier = Modifier.height(10.dp)) }

        item {
            Text(
                text = "📢 ثبت و انتشار اعلان رسمی برای اتاق",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = textInput,
                        onValueChange = { textInput = it },
                        placeholder = { Text("متن اعلان رسمی خود را وارد کنید...", fontSize = 11.sp, color = Color(0xFF94A3B8)) },
                        modifier = Modifier.fillMaxWidth().height(90.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = primaryColor,
                            unfocusedBorderColor = Color(0xFFCBD5E1)
                        )
                    )

                    Button(
                        onClick = {
                            if (textInput.isNotBlank()) {
                                announcements.add(0, HistoryItem(announcements.size + 1, "شهردار (محمد دلیری)", "هم‌اکنون", textInput))
                                textInput = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = primaryColor),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth().height(44.dp)
                    ) {
                        Text(
                            text = "ثبت و ارسال اعلان رسمی برای هم‌اتاقی‌ها",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        item {
            Text(
                text = "اعلان‌های فعال اخیر",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A),
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        items(announcements) { ann ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .border(BorderStroke(1.dp, Color(0xFFF1F5F9)), RoundedCornerShape(16.dp))
                    .padding(14.dp),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("📢", fontSize = 16.sp)
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(ann.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = primaryColor)
                        Text(ann.date, fontSize = 9.sp, color = Color(0xFF94A3B8))
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(ann.taskType, fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Color(0xFF334155))
                }
            }
        }
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

// ۳. مدیریت امتیازات هم‌اتاقی‌ها و وایت‌لیست ورود
@Composable
fun MayorManagePointsTabScreen(roomCode: String) {
    val primaryColor = Color(0xFF4F46E5)

    // حالت‌ها برای افزودن شماره همراه هماتاقی
    var roommatePhone by remember { mutableStateOf("") }
    var preAssignedName by remember { mutableStateOf("") }

    val whitelist = remember {
        mutableStateListOf(
            WhitelistPhone("+989123456789", "پوریا حسینی"),
            WhitelistPhone("+989987654321", "سهیل بهرامی")
        )
    }

    val roommatesList = remember {
        mutableStateListOf(
            RoommateRank(1, "امیررضا علوی", 210, 18, 2),
            RoommateRank(2, "محمد دلیری (شما)", 185, 15, 1, isMe = true),
            RoommateRank(3, "پوریا حسینی", 160, 13, 3),
            RoommateRank(4, "سهیل بهرامی", 145, 11, 4)
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Spacer(modifier = Modifier.height(10.dp)) }

        // بخش بالا: نمایش کد اتاق و دکمه کپی
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "🔑 کد اختصاصی اتاق شما جهت اشتراک‌گذاری",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B)
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFEEF2F6), RoundedCornerShape(12.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "کد اختصاصی اتاق: [\${roomCode}]",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = primaryColor
                        )

                        Button(
                            onClick = {},
                            colors = ButtonDefaults.buttonColors(containerColor = primaryColor),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.height(30.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp)
                        ) {
                            Text("کپی کردن کد", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // بخش فرم وایت‌لیست ورود هم‌اتاقی جدید
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F3FF)),
                border = BorderStroke(1.dp, Color(0xFFDDD6FE))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "👤 افزودن هم‌اتاقی جدید به لیست مجاز ورود (Whitelist)",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF6D28D9)
                    )

                    OutlinedTextField(
                        value = roommatePhone,
                        onValueChange = { roommatePhone = it },
                        placeholder = { Text("شماره همراه هماتاقی (الزامی)", fontSize = 10.sp, color = Color(0xFF94A3B8)) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF7C3AED),
                            unfocusedBorderColor = Color(0xFFCBD5E1),
                            containerColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = preAssignedName,
                        onValueChange = { preAssignedName = it },
                        placeholder = { Text("نام پیشنهادی هماتاقی (اختیاری)", fontSize = 10.sp, color = Color(0xFF94A3B8)) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF7C3AED),
                            unfocusedBorderColor = Color(0xFFCBD5E1),
                            containerColor = Color.White
                        )
                    )

                    Button(
                        onClick = {
                            if (roommatePhone.isNotBlank()) {
                                whitelist.add(WhitelistPhone(roommatePhone, preAssignedName.ifBlank { "هم‌اتاقی جدید" }))
                                roommatePhone = ""
                                preAssignedName = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7C3AED)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().height(40.dp)
                    ) {
                        Text(
                            text = "افزودن شماره به لیست مجاز",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    if (whitelist.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "لیست شماره‌های مجاز ثبت شده:",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF4B5563)
                        )
                        whitelist.forEach { item ->
                            Text(
                                text = "• شماره: \${item.phone} (\${item.namePlaceholder})",
                                fontSize = 9.sp,
                                color = Color(0xFF4B5563)
                            )
                        }
                    }
                }
            }
        }

        // بخش مدیریت امتیاز مسئولیت‌پذیری هم‌اتاقی‌ها
        item {
            Text(
                text = "👑 مدیریت امتیاز مسئولیت‌پذیری هم‌اتاقی‌ها",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A),
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        items(roommatesList) { roommate ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .border(BorderStroke(1.dp, Color(0xFFF1F5F9)), RoundedCornerShape(16.dp))
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = roommate.name,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E293B)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "امتیاز فعلی: \${roommate.points}",
                        fontSize = 10.sp,
                        color = primaryColor,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Button(
                        onClick = {
                            val idx = roommatesList.indexOf(roommate)
                            if (idx != -1) {
                                roommatesList[idx] = roommate.copy(points = roommate.points + 10)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFECFDF5)),
                        border = BorderStroke(1.dp, Color(0xFFA7F3D0)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(30.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp)
                    ) {
                        Text("۱۰+", color = Color(0xFF047857), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            val idx = roommatesList.indexOf(roommate)
                            if (idx != -1) {
                                roommatesList[idx] = roommate.copy(points = maxOf(0, roommate.points - 10))
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFEF2F2)),
                        border = BorderStroke(1.dp, Color(0xFFFCA5A5)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(30.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp)
                    ) {
                        Text("۱۰-", color = Color(0xFFB91C1C), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

// ۴. تاریخچه جامع اتفاقات اتاق
@Composable
fun MayorHistoryTabScreen() {
    val history = remember {
        listOf(
            HistoryItem(1, "پوریا حسینی", "امروز", "ثبت سفر آخر هفته (منتظر تایید شهردار)"),
            HistoryItem(2, "سهیل بهرامی", "دیروز", "درخواست کار اضافه برای نظافت آشپزخانه"),
            HistoryItem(3, "سیستم", "۲ روز قبل", "شماره همراه +989123456789 به وایت‌لیست اتاق ۴۰۲ اضافه شد.")
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Spacer(modifier = Modifier.height(10.dp)) }

        item {
            Text(
                text = "📋 تاریخچه جامع رویدادهای اتاق",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }

        items(history) { item ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .border(BorderStroke(1.dp, Color(0xFFF1F5F9)), RoundedCornerShape(16.dp))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(Color(0xFFEEF2F6), shape = CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("👤", fontSize = 14.sp)
                    }

                    Column {
                        Text(
                            text = item.name,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = item.taskType,
                            fontSize = 9.sp,
                            color = Color(0xFF64748B)
                        )
                    }
                }

                Text(
                    text = item.date,
                    fontSize = 10.sp,
                    color = Color(0xFF64748B)
                )
            }
        }
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}
`;
