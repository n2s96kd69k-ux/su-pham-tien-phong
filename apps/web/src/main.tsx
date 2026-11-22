import { createRoot } from "react-dom/client";
import {
	HashRouter,
	Routes,
	Route,
	Link,
	NavLink,
	Navigate,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import type { Profile } from "../../../packages/contracts";
import { auth, useIdentity, useResource } from "./client";
import { Catalog, Reader } from "./library";
import { Exam, Progress } from "./attempt";
import { Studio } from "./studio";
import { Action, LoginLink, PageTop, Status } from "./shared";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/600.css";
import "./style.css";
function Login() {
	const loc = useLocation(),
		nav = useNavigate();
	const [email, setEmail] = useState(""),
		[password, setPassword] = useState(""),
		[error, setError] = useState(""),
		[busy, setBusy] = useState(false);
	return (
		<article className="reader">
			<PageTop>Đăng nhập</PageTop>
			{!auth ? (
				<p className="notice">
					Đăng nhập chưa được cấu hình. Bạn vẫn có thể đọc các bài học trong thư
					viện.
				</p>
			) : (
				<form
					className="paper"
					onSubmit={async (e) => {
						e.preventDefault();
						if (!auth) return;
						setBusy(true);
						try {
							const result = await auth.auth.signInWithPassword({
								email,
								password,
							});
							if (result.error) throw result.error;
							nav(loc.state?.next || "/history", { replace: true });
						} catch {
							setError(
								"Đăng nhập chưa thành công. Kiểm tra kết nối và thông tin tài khoản.",
							);
						} finally {
							setBusy(false);
						}
					}}
				>
					<label>
						Email
						<input
							required
							type="email"
							autoComplete="username"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</label>
					<label>
						Mật khẩu
						<input
							required
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</label>
					<button type="submit" disabled={busy}>
						{busy ? "Đang đăng nhập…" : "Đăng nhập"}
					</button>
					{error && <Status error={error} />}
				</form>
			)}
		</article>
	);
}
function App() {
	const identity = useIdentity();
	return <Workspace key={identity ?? String(identity)} identity={identity} />;
}
function Workspace({ identity }: { identity: string | null | undefined }) {
	const { data: profile, error } = useResource<Profile>(
		identity ? "/me/profile" : null,
		0,
	);
	const loc = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [loc.pathname]);
	const staff = profile && profile.role !== "learner";
	const guard = (p: React.ReactNode) =>
		identity === undefined ? (
			<Status />
		) : !identity ? (
			<section className="reader">
				<h1>Không gian cá nhân</h1>
				<LoginLink />
			</section>
		) : !profile ? (
			<Status error={error} />
		) : (
			p
		);
	return (
		<>
			<button
				type="button"
				className="skip"
				onClick={() => {
					document.getElementById("main")?.focus();
				}}
			>
				Đến nội dung
			</button>
			<header>
				<div className="wrap head">
					<Link className="brand" to="/catalog">
						<span className="mark" aria-hidden="true">
							▥
						</span>
						<span>
							Sư Phạm
							<br />
							Tiên Phong
						</span>
					</Link>
					<nav aria-label="Điều hướng chính">
						<NavLink to="/catalog">Thư viện</NavLink>
						<NavLink to="/history">Tiến độ</NavLink>
						{staff && <NavLink to="/studio">Biên tập</NavLink>}
					</nav>
					{identity ? (
						<Action
							variant="plain account"
							run={async () => {
								const res = await auth?.auth.signOut();
								if (res?.error) throw res.error;
							}}
						>
							Đăng xuất
						</Action>
					) : (
						<Link className="account" to="/login">
							Đăng nhập
						</Link>
					)}
				</div>
			</header>
			<main className="wrap" id="main" tabIndex={-1}>
				<Routes>
					<Route path="/" element={<Navigate to="/catalog" replace />} />
					<Route path="/catalog" element={<Catalog />} />
					<Route
						path="/lessons/:id"
						element={<Reader key={loc.pathname} signed={!!identity} />}
					/>
					<Route path="/login" element={<Login />} />
					<Route path="/history" element={guard(<Progress />)} />
					<Route
						path="/attempts/:id"
						element={guard(<Exam key={loc.pathname} />)}
					/>
					<Route
						path="/studio"
						element={guard(
							staff ? (
								<Studio profile={profile} />
							) : (
								<Status error="Tài khoản chưa có quyền biên tập." />
							),
						)}
					/>
					<Route
						path="*"
						element={
							<section>
								<h1>Trang chưa có trong thư viện</h1>
								<Link to="/catalog">Về thư viện</Link>
							</section>
						}
					/>
				</Routes>
			</main>
			<footer className="wrap">
				Sư Phạm Tiên Phong <span>Thư viện &amp; luyện tập</span>
			</footer>
		</>
	);
}
const root = document.getElementById("root");
if (root)
	createRoot(root).render(
		<HashRouter>
			<App />
		</HashRouter>,
	);
