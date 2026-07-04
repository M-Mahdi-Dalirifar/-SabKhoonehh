export const jetpackComposeCode = `package ir.sabkhooneh.app.ui.login

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview

// صابخونه - صفحه ورود و ثبت‌نام هماهنگ‌شده با منطق کد اختصاصی اتاق و وریفیکیشن
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: (username: String, role: String, roomCode: String) -> Unit = { _, _, _ -> }
) {
    // تم رنگی لوکس صابخونه
    val primaryColor = Color(0xFF4F46E5) // Indigo 600
    val secondaryColor = Color(0xFF7C3AED) // Purple 600

    // حالت‌ها (States)
    var isMayorSelected by remember { mutableStateOf(true) }
    
    // فیلدهای شهردار
    var mayorName by remember { mutableStateOf("") }
    var mayorPhone by remember { mutableStateOf("") }
    var suiteName by remember { mutableStateOf("") }
    
    // فیلدهای شهروند
    var citizenPhone by remember { mutableStateOf("") }
    var roomCode by remember { mutableStateOf("") }

    // وضعیت دریافت کد و تأیید هویت
    var showOtpSection by remember { mutableStateOf(false) }
    var generatedRoomCode by remember { mutableStateOf("") }
    var showUsernameDialog by remember { mutableStateOf(false) }
    var preferredUsername by remember { mutableStateOf("") }

    // آرایه ۴تایی برای کد تایید پیامکی
    val otpValues = remember { mutableStateListOf("", "", "", "") }
    val focusRequesters = remember { List(4) { FocusRequester() } }

    // تحمیل چیدمان راست‌چین (RTL) برای زبان فارسی
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFFF8FAFC) // Slate 50 (رنگ پس‌زمینه تم Sleek)
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Spacer(modifier = Modifier.height(10.dp))

                    // لوگو و عنوان برند
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .background(
                                    brush = Brush.linearGradient(
                                        colors = listOf(primaryColor, secondaryColor)
                                    ),
                                    shape = RoundedCornerShape(18.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "صاب",
                                color = Color.White,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                textAlign = TextAlign.Center
                            )
                        }

                        Text(
                            text = "صابخونه",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )

                        Text(
                            text = "مدیریت هوشمند و منظم خوابگاه",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF64748B)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // سگمنت انتخاب نقش (شهردار / شهروند)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .background(Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(
                                    color = if (isMayorSelected) Color.White else Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable { 
                                    isMayorSelected = true 
                                    showOtpSection = false
                                    generatedRoomCode = ""
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "ثبت‌نام شهردار جدید",
                                fontSize = 11.sp,
                                fontWeight = if (isMayorSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isMayorSelected) primaryColor else Color(0xFF475569)
                            )
                        }

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(
                                    color = if (!isMayorSelected) Color.White else Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable { 
                                    isMayorSelected = false 
                                    showOtpSection = false
                                    generatedRoomCode = ""
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "ورود هم‌اتاقی (شهروند)",
                                fontSize = 11.sp,
                                fontWeight = if (!isMayorSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (!isMayorSelected) primaryColor else Color(0xFF475569)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // فیلدهای ورودی مشروط بر اساس نقش انتخابی
                    if (isMayorSelected) {
                        // فرم ثبت نام شهردار
                        OutlinedTextField(
                            value = mayorName,
                            onValueChange = { mayorName = it },
                            label = { Text("نام شهردار") },
                            placeholder = { Text("مثال: محمد دلیری") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF94A3B8)) },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = primaryColor,
                                unfocusedBorderColor = Color(0xFFCBD5E1)
                            )
                        )

                        OutlinedTextField(
                            value = mayorPhone,
                            onValueChange = { mayorPhone = it },
                            label = { Text("شماره همراه") },
                            placeholder = { Text("مثال: 09123456789") },
                            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = Color(0xFF94A3B8)) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = primaryColor,
                                unfocusedBorderColor = Color(0xFFCBD5E1)
                            )
                        )

                        OutlinedTextField(
                            value = suiteName,
                            onValueChange = { suiteName = it },
                            label = { Text("نام سوئیت / شماره اتاق") },
                            placeholder = { Text("مثال: اتاق ۴۰۲ (امید)") },
                            leadingIcon = { Icon(Icons.Default.Home, contentDescription = null, tint = Color(0xFF94A3B8)) },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = primaryColor,
                                unfocusedBorderColor = Color(0xFFCBD5E1)
                            )
                        )
                    } else {
                        // فرم ورود هم‌اتاقی (شهروند) - بدون فیلد نام کاربری اولیه
                        OutlinedTextField(
                            value = citizenPhone,
                            onValueChange = { citizenPhone = it },
                            label = { Text("شماره همراه") },
                            placeholder = { Text("مثال: 09123456789") },
                            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = Color(0xFF94A3B8)) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = primaryColor,
                                unfocusedBorderColor = Color(0xFFCBD5E1)
                            )
                        )

                        OutlinedTextField(
                            value = roomCode,
                            onValueChange = { roomCode = it },
                            label = { Text("کد اختصاصی اتاق") },
                            placeholder = { Text("مثال: SAB402") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF94A3B8)) },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = primaryColor,
                                unfocusedBorderColor = Color(0xFFCBD5E1)
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // دکمه ارسال اطلاعات و فعال‌سازی فرآیند OTP
                    Button(
                        onClick = {
                            if (isMayorSelected) {
                                if (mayorName.isNotEmpty() && mayorPhone.isNotEmpty() && suiteName.isNotEmpty()) {
                                    // تولید کد اختصاصی منحصر به فرد برای سوئیت جدید
                                    generatedRoomCode = "SAB" + (100..999).random().toString()
                                    showOtpSection = true
                                }
                            } else {
                                if (citizenPhone.isNotEmpty() && roomCode.isNotEmpty()) {
                                    showOtpSection = true
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = primaryColor)
                    ) {
                        Text(
                            text = if (isMayorSelected) "ایجاد اتاق و دریافت کد ورود" else "ارسال و دریافت کد تایید",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // نمایش کد اتاق تولید شده برای شهردار به صورت برجسته
                    if (isMayorSelected && generatedRoomCode.isNotEmpty()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFEEF2F6)),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "✓ سوئیت شما با موفقیت ثبت شد!",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF16A34A)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "کد اختصاصی اتاق شما جهت اشتراک‌گذاری:",
                                    fontSize = 10.sp,
                                    color = Color(0xFF475569)
                                )
                                Text(
                                    text = generatedRoomCode,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = primaryColor,
                                    letterSpacing = 1.sp
                                )
                            }
                        }
                    }

                    // بخش کد پیامکی یکبار مصرف (OTP)
                    AnimatedVisibility(
                        visible = showOtpSection,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Divider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
                                Text(
                                    text = "کد ۴ رقمی تایید پیامکی را وارد کنید",
                                    color = Color(0xFF475569),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp)
                                )
                                Divider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
                            }

                            // ۴ فیلد مربعی OTP
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                for (i in 0..3) {
                                    OutlinedTextField(
                                        value = otpValues[i],
                                        onValueChange = { value ->
                                            if (value.length <= 1) {
                                                otpValues[i] = value
                                                if (value.isNotEmpty() && i < 3) {
                                                    focusRequesters[i + 1].requestFocus()
                                                }
                                                
                                                val completeOtp = otpValues.joinToString("")
                                                if (completeOtp.length == 4) {
                                                    // شبیه‌ساز بررسی موفقیت OTP
                                                    if (isMayorSelected) {
                                                        onLoginSuccess(mayorName, "شهردار", generatedRoomCode)
                                                    } else {
                                                        // برای هم‌اتاقی جدید، دیالوگ نام کاربری دلخواه باز شود
                                                        showUsernameDialog = true
                                                    }
                                                }
                                            }
                                        },
                                        modifier = Modifier
                                            .size(50.dp)
                                            .focusRequester(focusRequesters[i]),
                                        textStyle = TextStyle(
                                            fontSize = 18.sp,
                                            fontWeight = FontWeight.Bold,
                                            textAlign = TextAlign.Center,
                                            color = Color(0xFF0F172A)
                                        ),
                                        singleLine = true,
                                        keyboardOptions = KeyboardOptions(
                                            keyboardType = KeyboardType.Number,
                                            imeAction = if (i == 3) ImeAction.Done else ImeAction.Next
                                        ),
                                        shape = RoundedCornerShape(10.dp),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = primaryColor,
                                            unfocusedBorderColor = Color(0xFFCBD5E1),
                                            focusedContainerColor = Color(0xFFF1F5F9)
                                        )
                                    )
                                }
                            }
                        }
                    }
                }

                // دیالوگ زیبای نام کاربری دلخواه برای ورود اولین بار هم‌اتاقی (Citizen)
                if (showUsernameDialog) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.5f))
                            .clickable(enabled = false) {},
                        contentAlignment = Alignment.Center
                    ) {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth(0.85f)
                                .padding(16.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(
                                modifier = Modifier.padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                Text(
                                    text = "✨ اولین ورود هم‌اتاقی",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = primaryColor
                                )

                                Text(
                                    text = "کد تایید پیامکی تایید شد! نام کاربری دلخواه خود را جهت نمایش در اتاق وارد کنید:",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF475569),
                                    textAlign = TextAlign.Center,
                                    lineHeight = 18.sp
                                )

                                OutlinedTextField(
                                    value = preferredUsername,
                                    onValueChange = { preferredUsername = it },
                                    label = { Text("نام کاربری دلخواه") },
                                    placeholder = { Text("مثال: سهیل بهرامی") },
                                    singleLine = true,
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = primaryColor,
                                        unfocusedBorderColor = Color(0xFFCBD5E1)
                                    )
                                )

                                Button(
                                    onClick = {
                                        if (preferredUsername.trim().isNotEmpty()) {
                                            showUsernameDialog = false
                                            onLoginSuccess(preferredUsername.trim(), "شهروند", roomCode)
                                        }
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(44.dp),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = primaryColor)
                                ) {
                                    Text(
                                        text = "ثبت و ورود به خوابگاه",
                                        color = Color.White,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 360, heightDp = 640)
@Composable
fun LoginScreenPreview() {
    LoginScreen()
}
`;
